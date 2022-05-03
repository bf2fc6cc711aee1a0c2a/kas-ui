import { CreateKafkaInstanceWithSizesTypes } from '@rhoas/app-services-ui-components';
import { Quota, QuotaType, QuotaValue, useAuth, useConfig, useQuota } from '@rhoas/app-services-ui-shared';
import { CloudRegion, Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { InstanceType } from '@app/utils';

// TODO this method is
export const useAvailableProvidersAndDefault = () => {
  const { kas, getUsername } = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { getQuota } = useQuota();

  function getApi() {
    return new DefaultApi(
      new Configuration({
        accessToken: kas.getToken(),
        basePath,
      })
    );
  }

  // TODO most evil function. PR cannot be merged without refactoring this method!
  const fetchQuota = async (): Promise<Quota['data']> => {
    return new Promise((resolve, reject) => {
      async function getQuotaData() {
        const quota = await getQuota();
        if (quota.isServiceDown) {
          console.error('useAvailableProvidersAndDefault', 'fetchQuota rejected because isServiceDown is true');
          reject();
        } else if (quota.loading) {
          console.warn('useAvailableProvidersAndDefault', 'fetchQuota', 'quota is loading, retrying in 1000ms');
          setTimeout(getQuota, 1000);
        } else {
          resolve(quota.data);
        }
      }
      getQuotaData();
    });
  };

  // Function to fetch cloud Regions based on selected filter
  const fetchRegions = async (
    id: string,
    plan: CreateKafkaInstanceWithSizesTypes.Plan
  ): Promise<CreateKafkaInstanceWithSizesTypes.Regions> => {
    const apisService = getApi();
    const res = await apisService.getCloudProviderRegions(id);

    if (!res?.data?.items) {
      return [];
    }

    const instance_type = plan === 'standard' ? InstanceType.standard : getInstanceTypeForResponse(res.data.items);

    const regionsForInstance = res.data.items.filter(
      (p) => p.enabled && p.capacity.some((c) => c.instance_type === instance_type)
    );

    return regionsForInstance.map((r): CreateKafkaInstanceWithSizesTypes.RegionInfo => {
      let max_capacity_reached = false;
      // Backwards compatibility remove once eval type is removed
      if (instance_type == InstanceType.eval) {
        max_capacity_reached = r.capacity?.some((c) => c.max_capacity_reached === true);
      } else {
        max_capacity_reached = r.capacity?.some((c) => c.available_sizes?.length === 0);
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: r.id!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        displayName: r.display_name!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        isDisabled: max_capacity_reached,
      };
    });
  };

  // FUTURE: this method should be removed and replaced with InstanceType.developer value
  const getInstanceTypeForResponse = (regions: CloudRegion[]): InstanceType => {
    const detectedNewAPI = !!regions.find((info) => {
      return info.capacity.find((capacity) => {
        return !!capacity.available_sizes;
      });
    });

    if (detectedNewAPI) {
      return InstanceType.developer;
    } else {
      return InstanceType.eval;
    }
  };

  const fetchProviders = async (
    plan: CreateKafkaInstanceWithSizesTypes.Plan
  ): Promise<CreateKafkaInstanceWithSizesTypes.Providers> => {
    try {
      const apisService = getApi();
      const res = await apisService.getCloudProviders();
      const allProviders = res?.data?.items || [];
      return await Promise.all(
        allProviders
          .filter((p) => p.enabled)
          .map(async (provider): Promise<CreateKafkaInstanceWithSizesTypes.ProviderInfo> => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const regions = await fetchRegions(provider.id!, plan);
            return {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              id: provider.id!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              displayName: provider.display_name!,
              regions,
            };
          })
      );
    } catch (e) {
      console.error('useAvailableProvidersAndDefault', 'fetchProvider', e);
      return Promise.reject(e);
    }
  };

  // TODO - this logic should not exist and be replaced with AMS quota.
  const fetchUserHasTrialInstance = async (): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const loggedInUser = await getUsername()!;
      const filter = `owner = ${loggedInUser}`;
      const apisService = getApi();
      const res = await apisService.getKafkas('', '', '', filter);
      if (res.data.items) {
        return res.data.items.some(
          (k) => k?.instance_type === InstanceType?.eval || k?.instance_type === InstanceType?.developer
        );
      }
    } catch (e) {
      console.error('useAvailableProvidersAndDefault', 'fetchUserHasTrialInstance', e);
    }
    return false;
  };

  return async function (): Promise<CreateKafkaInstanceWithSizesTypes.CreateKafkaInitializationData> {
    try {
      const quota = await fetchQuota();
      const hasTrialRunning = await fetchUserHasTrialInstance();

      let kasQuota: QuotaValue | undefined;
      try {
        kasQuota = quota?.get(QuotaType?.kas);
      } catch (e) {
        console.error('useAvailableProvidersAndDefault', 'quota?.get exception', e);
      }

      const plan: CreateKafkaInstanceWithSizesTypes.Plan =
        kasQuota !== undefined && kasQuota.remaining > 0 ? 'standard' : 'trial';

      const availableProviders = await fetchProviders(plan);
      let defaultProvider: CreateKafkaInstanceWithSizesTypes.Provider | undefined;
      try {
        defaultProvider = availableProviders.length === 1 ? availableProviders[0].id : undefined;
      } catch (e) {
        console.error('useAvailableProvidersAndDefault', 'defaultProvider error', e);
      }

      // TODO: figure out how to get the status of the system to pass to the dialog to show the right state
      const instanceAvailability: CreateKafkaInstanceWithSizesTypes.InstanceAvailability = hasTrialRunning
        ? 'trial-used'
        : 'standard-available';

      return {
        defaultProvider,
        availableProviders,
        instanceAvailability,
        maxStreamingUnits: 5,
        remainingStreamingUnits: 4,
        plan,
      };
    } catch (e) {
      console.error('useAvailableProvidersAndDefault', e);
      return Promise.reject(e);
    }
  };
};
