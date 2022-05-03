import { InstanceType } from '@app/utils';
import { QuotaType, useAuth, useConfig, useQuota } from '@rhoas/app-services-ui-shared';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { Size } from 'app-services-ui-components/types/src/Kafka/CreateKafkaInstanceWithSizes/types';

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

  // TODO progress, error handling
  return async (provider: string, region: string) => {
    const api = new DefaultApi(
      new Configuration({
        accessToken: kas.getToken(),
        basePath,
      })
    );
    // TODO quota calculation/instance selection needs refactoring
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
        return instanceTypesSizes.map((s) => {
          return {
            id: s.id,
            streamingUnits: s.quota_consumed,
            ingress: s.ingress_throughput_per_sec,
            egress: s.egress_throughput_per_sec,
            storage: s.max_data_retention_size,
            connections: s.total_max_connections,
            connectionRate: s.max_connection_attempts_per_sec,
            maxPartitions: s.max_partitions,
            // TODO https://issues.redhat.com/browse/MGDSTRM-8385
            messageSize: 10000,
          } as Size;
        });
      } else {
        // TODO This case should never happen
        console.error('Missing');
        return [];
      }
    }

    return [];
  };
}
