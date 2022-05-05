import { InstanceType } from '@app/utils';
import { CreateKafkaInstanceWithSizesTypes } from '@rhoas/app-services-ui-components';
import { Size } from '@rhoas/app-services-ui-components/types/src/Kafka/CreateKafkaInstanceWithSizes/types';
import { QuotaType, useAuth, useConfig, useQuota } from '@rhoas/app-services-ui-shared';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';

/**
 * Return list of the instance types available for the current user
 *
 * @returns {Promise<InstanceType[]>}
 */
export function useGetAvailableSizes() {
  const { getQuota } = useQuota();
  const { kas } = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  return async (provider: string, region: string): Promise<CreateKafkaInstanceWithSizesTypes.GetSizesData> => {
    const api = new DefaultApi(
      new Configuration({
        accessToken: kas.getToken(),
        basePath,
      })
    );

    const quota = await getQuota();
    const kasQuota = quota?.data?.get(QuotaType?.kas);
    const instanceType = kasQuota ? InstanceType.standard : InstanceType.developer;

    const sizes = await api.getInstanceTypesByCloudProviderAndRegion(provider, region);
    if (sizes?.data?.instance_types) {
      let instanceTypesSizes = sizes?.data?.instance_types.find((i) => i.id === instanceType)?.sizes;
      if (instanceTypesSizes) {
        if (kasQuota) {
          instanceTypesSizes = instanceTypesSizes.filter((s) => (s.quota_consumed || 0) <= kasQuota.remaining);
        }
        // TODO filter sizes that do not fit to the region
        const componentSizes = instanceTypesSizes.map((s) => {
          return {
            id: s.id,
            streamingUnits: s.quota_consumed,
            ingress: (s.ingress_throughput_per_sec?.bytes || 0) / 1048576,
            egress: (s.egress_throughput_per_sec?.bytes || 0) / 1048576,
            storage: Math.round((s.max_data_retention_size?.bytes  || 0) / (1073741824)),
            connections: s.total_max_connections,
            connectionRate: s.max_connection_attempts_per_sec,
            maxPartitions: s.max_partitions,
            // TODO https://issues.redhat.com/browse/MGDSTRM-8385
            messageSize: 1,
          } as Size;
        });
        return { sizes: componentSizes };
      } else {
        // TODO This case should never happen
        console.error('Cannot match instance type to backend response.', instanceType);
        return { sizes: [] };
      }
    }

    return { sizes: [] };
  };
}
