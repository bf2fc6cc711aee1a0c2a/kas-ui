import { InstanceType } from "@app/utils";
import { CreateKafkaInstanceWithSizesTypes } from "@rhoas/app-services-ui-components";
import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";
import { SupportedKafkaSize } from "@rhoas/kafka-management-sdk/dist/generated/model/supported-kafka-size";

/**
 * Return list of the instance types available for the current user
 *
 * @returns {Promise<InstanceType[]>}
 */
export type SizesData = CreateKafkaInstanceWithSizesTypes.GetSizesData;

export function useGetAvailableSizes() {
  const { kas } = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  return async (
    provider: string,
    region: string,
    availableSizes: string[]
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
    if (!sizes?.data?.instance_types) {
      throw new Error(`No instance_types from backend`);
    }

    const standardSizes =
      sizes?.data?.instance_types.find((i) => i.id === InstanceType.standard)
        ?.sizes || [];
    const trialSizes =
      sizes?.data?.instance_types.find((i) => i.id === InstanceType.developer)
        ?.sizes || [];
    const trialSize =
      trialSizes.length > 0
        ? (trialSizes[trialSizes.length - 1] as Required<SupportedKafkaSize>)
        : undefined;
    const componentSizes =
      standardSizes.map<CreateKafkaInstanceWithSizesTypes.Size>(
        (sizeFromApi) => {
          const s = sizeFromApi as Required<SupportedKafkaSize>;
          return {
            id: s.id,
            displayName: s.display_name,
            quota: s.quota_consumed,
            ingress: (s.ingress_throughput_per_sec.bytes || 0) / 1048576,
            egress: (s.egress_throughput_per_sec.bytes || 0) / 1048576,
            storage: Math.round(
              (s.max_data_retention_size.bytes || 0) / 1073741824
            ),
            connections: s.total_max_connections,
            connectionRate: s.max_connection_attempts_per_sec,
            maxPartitions: s.max_partitions,
            messageSize: (s.max_message_size.bytes || 0) / 1048576,
            status: s.maturity_status === "stable" ? "stable" : "preview",
            trialDurationHours: undefined,
            isDisabled: !availableSizes.includes(`standard.${s.id}`),
          };
        }
      );
    return {
      standard: componentSizes,
      trial: trialSize
        ? {
            id: trialSize.id,
            displayName: trialSize.display_name,
            quota: 0,
            ingress:
              (trialSize.ingress_throughput_per_sec.bytes || 0) / 1048576,
            egress: (trialSize.egress_throughput_per_sec.bytes || 0) / 1048576,
            storage: Math.round(
              (trialSize.max_data_retention_size.bytes || 0) / 1073741824
            ),
            connections: trialSize.total_max_connections,
            connectionRate: trialSize.max_connection_attempts_per_sec,
            maxPartitions: trialSize.max_partitions,
            messageSize: (trialSize.max_message_size.bytes || 0) / 1048576,
            status:
              trialSize.maturity_status === "stable" ? "stable" : "preview",
            trialDurationHours: trialSize.lifespan_seconds
              ? trialSize.lifespan_seconds / 60 / 60
              : undefined,
            isDisabled: !availableSizes.includes(`developer.${trialSize.id}`),
          }
        : (undefined as unknown as CreateKafkaInstanceWithSizesTypes.Size),
    };
  };
}
