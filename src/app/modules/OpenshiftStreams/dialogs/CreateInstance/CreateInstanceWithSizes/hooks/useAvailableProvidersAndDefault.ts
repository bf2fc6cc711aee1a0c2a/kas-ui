import { CreateKafkaInstanceWithSizesTypes } from "@rhoas/app-services-ui-components";
import { useAuth, useConfig, QuotaType } from "@rhoas/app-services-ui-shared";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";
import { InstanceType } from "@app/utils";
import {
  convertQuotaToInstanceType,
  getQuotaType,
  useAMSQuota,
} from "./useAMSQuota";

/**
 * Hooks for fetching available providers and their regions
 *
 * @returns
 */
export const useAvailableProvidersAndDefault = () => {
  const { kas, getUsername } = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const getQuota = useAMSQuota();

  function getApi() {
    return new DefaultApi(
      new Configuration({
        accessToken: kas.getToken(),
        basePath,
      })
    );
  }

  // Function to fetch cloud Regions based on selected filter
  const fetchRegions = async (
    id: string,
    instance_type: string
  ): Promise<CreateKafkaInstanceWithSizesTypes.Regions> => {
    const apisService = getApi();
    const res = await apisService.getCloudProviderRegions(id);

    if (!res?.data?.items) {
      return [];
    }

    const regionsForInstance = res.data.items.filter(
      (p) =>
        p.enabled && p.capacity.some((c) => c.instance_type === instance_type)
    );

    return regionsForInstance.map(
      (r): CreateKafkaInstanceWithSizesTypes.RegionInfo => {
        const max_capacity_reached = r.capacity?.some(
          (c) => c.available_sizes?.length === 0
        );

        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: r.id!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          displayName: r.display_name!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          isDisabled: max_capacity_reached,
        };
      }
    );
  };

  const fetchProviders = async (
    instance_type: string
  ): Promise<CreateKafkaInstanceWithSizesTypes.Providers> => {
    try {
      const apisService = getApi();
      const res = await apisService.getCloudProviders();
      const allProviders = res?.data?.items || [];
      return await Promise.all(
        allProviders
          .filter((p) => p.enabled)
          .map(
            async (
              provider
            ): Promise<CreateKafkaInstanceWithSizesTypes.ProviderInfo> => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const regions = await fetchRegions(provider.id!, instance_type);
              return {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                id: provider.id!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                displayName: provider.display_name!,
                regions,
              };
            }
          )
      );
    } catch (e) {
      console.error("useAvailableProvidersAndDefault", "fetchProvider", e);
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
      const res = await apisService.getKafkas("", "", "", filter);
      if (res.data.items) {
        return res.data.items.some(
          (k) =>
            k?.instance_type === InstanceType?.eval ||
            k?.instance_type === InstanceType?.developer
        );
      }
    } catch (e) {
      console.error(
        "useAvailableProvidersAndDefault",
        "fetchUserHasTrialInstance",
        e
      );
    }
    return false;
  };

  return async function (): Promise<CreateKafkaInstanceWithSizesTypes.CreateKafkaInitializationData> {
    try {
      const quota = await getQuota();
      const plan = getQuotaType(quota.data);
      const instanceType = convertQuotaToInstanceType(quota.data);
      const kasQuota = quota?.data?.get(QuotaType?.kas);

      const hasTrialRunning = await fetchUserHasTrialInstance();
      const availableProviders = await fetchProviders(instanceType);
      let defaultProvider:
        | CreateKafkaInstanceWithSizesTypes.Provider
        | undefined;
      try {
        defaultProvider =
          availableProviders.length === 1
            ? availableProviders[0].id
            : undefined;
      } catch (e) {
        console.error(
          "useAvailableProvidersAndDefault",
          "defaultProvider error",
          e
        );
      }

      const instanceAvailability =
        ((): CreateKafkaInstanceWithSizesTypes.InstanceAvailability => {
          switch (true) {
            case kasQuota !== undefined && kasQuota.remaining > 0:
              return "standard-available";
            case kasQuota !== undefined && kasQuota.remaining === 0:
              return "over-quota";
            case hasTrialRunning:
              return "trial-used";
            default:
              return "trial-available";
          }
        })();

      return {
        defaultProvider,
        availableProviders,
        instanceAvailability,
        maxStreamingUnits: kasQuota?.allowed || 0,
        remainingQuota: kasQuota?.remaining || 0,
        plan,
      };
    } catch (e) {
      console.error("useAvailableProvidersAndDefault", e);
      return Promise.reject(e);
    }
  };
};
