import { useKms } from "@app/api";
import { useCallback } from "react";
import type {
  CloudProvider,
  KafkaInstance,
  KafkaInstancesProps,
  Plan,
  Status,
} from "@rhoas/app-services-ui-components";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";
import { AxiosCacheRequestConfig } from "axios-simple-cache-adapter";
import {
  useGetSizes,
  useStandardQuota,
} from "@app/modules/OpenshiftStreams/dialogs/CreateInstance/hooks";

export type KafkaInstanceEnhanced = Required<KafkaInstance> & {
  request: KafkaRequest;
};

export function useKafkaInstances() {
  const getKms = useKms();
  const { kafkaRequestToKafkaInstance } = useEnrichedKafkaInstance();
  return useCallback<
    KafkaInstancesProps<KafkaInstanceEnhanced>["getInstances"]
  >(
    async (page, perPage, query, sort, direction) => {
      // const filterQuery = getFilterQuery();
      const apisService = getKms();

      type columns = NonNullable<typeof sort>;
      const uiColumnMapping: { [key in columns]: string } = {
        name: "name",
        owner: "owner",
        provider: "cloud_provider",
        region: "region",
        createdAt: "created_at",
      };
      type QueryableField = keyof typeof query;
      const queryColumnMapping: { [key in QueryableField]: string } = {
        name: "name",
        owner: "owner",
        status: "status",
      };

      try {
        const res = await apisService.getKafkas(
          page.toString(10),
          perPage.toString(10),
          sort ? `${uiColumnMapping[sort]} ${direction}` : undefined,
          Object.entries(query)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, values]) => values.length > 0)
            .map(([key, values]) =>
              values
                .map(
                  (v) =>
                    `${
                      queryColumnMapping[key as QueryableField]
                    } like %${v.trim()}%`
                )
                .join(" or ")
            )
            .join(" and "),
          {
            cache: false,
          } as AxiosCacheRequestConfig
        );
        const rawInstances = res.data.items;
        const count = res.data.total;
        const instances = await Promise.all(
          rawInstances.map(kafkaRequestToKafkaInstance)
        );
        return {
          instances,
          count,
        };
      } catch (error) {
        // handleServerError(error);
        return {
          instances: [],
          count: 0,
        };
      }
    },
    [getKms, kafkaRequestToKafkaInstance]
  );
}

export function useEnrichedKafkaInstance() {
  const getQuota = useStandardQuota();
  const getDeveloperSizes = useGetSizes("developer");
  const getStandardSizes = useGetSizes("standard");

  const kafkaRequestToKafkaInstance = useCallback(
    async (data: KafkaRequest): Promise<KafkaInstanceEnhanced> => {
      const d = data as Required<KafkaRequest>;

      const { marketplaceSubscriptions } = await getQuota();

      const enhancedInstance: KafkaInstanceEnhanced = {
        billing: undefined,
        connectionRate: 0,
        connections: 0,
        createdAt: d.created_at,
        egress: 0,
        expiryDate: d.expires_at as string | undefined,
        id: d.id,
        ingress: 0,
        maxPartitions: 0,
        messageSize: 0,
        name: d.name,
        owner: d.owner,
        plan: d.billing_model as Plan,
        provider: d.cloud_provider as CloudProvider,
        region: d.region,
        size: "1",
        status: d.status as Status,
        storage: 0,
        updatedAt: d.updated_at,
        request: d,
      };

      // update the billing info
      try {
        const marketplaceForBilling = marketplaceSubscriptions.find((ms) =>
          ms.subscriptions.find((s) => s === d.billing_cloud_account_id)
        )?.marketplace;

        const billing: KafkaInstanceEnhanced["billing"] =
          d.billing_model === "standard"
            ? "prepaid"
            : marketplaceForBilling
            ? {
                marketplace: marketplaceForBilling,
                subscription: d.billing_cloud_account_id,
              }
            : undefined;
        enhancedInstance.billing = billing;
      } catch (e) {
        console.warn(
          "kafkaRequestToKafkaInstance",
          `couldn't retrieve the billing info for`,
          d
        );
      }

      // update the limits
      try {
        const limits =
          d.instance_type === "developer"
            ? await getDeveloperSizes(
                d.cloud_provider as CloudProvider,
                d.region
              )
            : await getStandardSizes(
                d.cloud_provider as CloudProvider,
                d.region
              );
        const thisInstanceLimits = limits.find((l) => l.id === d.size_id);
        if (thisInstanceLimits) {
          enhancedInstance.size = thisInstanceLimits.displayName;
          enhancedInstance.ingress = thisInstanceLimits.ingress;
          enhancedInstance.egress = thisInstanceLimits.egress;
          enhancedInstance.storage = d.max_data_retention_size.bytes;
          enhancedInstance.connections = thisInstanceLimits.connections;
          enhancedInstance.connectionRate = thisInstanceLimits.connectionRate;
          enhancedInstance.maxPartitions = thisInstanceLimits.maxPartitions;
          enhancedInstance.messageSize = thisInstanceLimits.messageSize;
        }
      } catch (e) {
        console.warn(
          "kafkaRequestToKafkaInstance",
          `couldn't retrieve the limits info for`,
          d
        );
      }

      return enhancedInstance;
    },
    [getDeveloperSizes, getQuota, getStandardSizes]
  );

  return {
    kafkaRequestToKafkaInstance,
  };
}
