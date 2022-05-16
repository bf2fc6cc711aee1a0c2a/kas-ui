import { InstanceType, convertBytesToUnit } from "@app/utils";
import { CreateKafkaInstanceWithSizesTypes } from "@rhoas/app-services-ui-components";
import { Size } from "@rhoas/app-services-ui-components/types/src/Kafka/CreateKafkaInstanceWithSizes/types";
import {
  QuotaType,
  useAuth,
  useConfig,
  useQuota,
} from "@rhoas/app-services-ui-shared";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";

/**
 * Return list of the instance types available for the current user
 *
 * @returns {Promise<InstanceType[]>}
 */

export const useGetAvailableSizes = () => {
  const { kas } = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  return async (
    provider: string,
    region: string,
    instanceType: InstanceType
  ): Promise<CreateKafkaInstanceWithSizesTypes.GetSizesData> => {
    const api = new DefaultApi(
      new Configuration({
        accessToken: kas.getToken(),
        basePath,
      })
    );

    const sizes = await api.getInstanceTypesByCloudProviderAndRegion(
      provider,
      region
    );
    if (sizes?.data?.instance_types) {
      const instanceTypesSizes = sizes?.data?.instance_types.find(
        (i) => i.id === instanceType
      )?.sizes;
      if (instanceTypesSizes) {
        const componentSizes = instanceTypesSizes.map((s) => {
          return {
            id: s.id,
            displayName: s.display_name,
            quota: s.quota_consumed,
            ingress: convertBytesToUnit(
              s.ingress_throughput_per_sec?.bytes || 0,
              "MiB"
            ),
            egress: convertBytesToUnit(
              s.egress_throughput_per_sec?.bytes || 0,
              "MiB"
            ),
            storage: Math.round(
              convertBytesToUnit(s.max_data_retention_size?.bytes || 0, "GiB")
            ),
            connections: s.total_max_connections,
            connectionRate: s.max_connection_attempts_per_sec,
            maxPartitions: s.max_partitions,
            messageSize: convertBytesToUnit(
              s.max_message_size?.bytes || 0,
              "MiB"
            ),
            status: instanceType === "standard" ? "stable" : "preview",
          } as Size;
        });
        return { sizes: componentSizes };
      } else {
        // TODO This case should never happen
        console.error(
          "Cannot match instance type to backend response.",
          instanceType
        );
        return { sizes: [] };
      }
    }

    return { sizes: [] };
  };
};

/**
 * Return list of the instance types available for the current user
 *
 * @returns {Promise<InstanceType[]>}
 */
export function useGetAvailableSizesWithQuota() {
  const { getQuota } = useQuota();
  const getAvailableSizes = useGetAvailableSizes();

  return async (
    provider: string,
    region: string
  ): Promise<CreateKafkaInstanceWithSizesTypes.GetSizesData> => {
    const quota = await getQuota();
    const kasQuota = quota?.data?.get(QuotaType?.kas);
    const instanceType = kasQuota
      ? InstanceType.standard
      : InstanceType.developer;

    return getAvailableSizes(provider, region, instanceType);
  };
}
