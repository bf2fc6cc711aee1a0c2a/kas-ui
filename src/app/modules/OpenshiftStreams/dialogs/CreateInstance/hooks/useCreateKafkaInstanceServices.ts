import { useAms, useKms } from "@app/api";
import { InstanceType } from "@app/utils";
import {
  CloudProvider,
  CloudProviderInfo,
  CreateKafkaInstanceServices,
  MarketPlace,
  MarketPlaceSubscriptions,
  RegionInfo,
  Size,
  StandardSizes,
} from "@rhoas/app-services-ui-components";
import { useAuth } from "@rhoas/app-services-ui-shared";
import { CloudRegion, SupportedKafkaSize } from "@rhoas/kafka-management-sdk";
import { useCallback } from "react";
import { QuotaCost } from "@rhoas/account-management-sdk";

const standardId = "RHOSAK" as const;
const developerId = "RHOSAKTrial" as const;
const resourceName = "rhosak" as const;

function isStandardQuota(q: QuotaCost) {
  return q.related_resources?.find((r) => r.billing_model === "standard");
}
function isMarketplaceQuota(q: QuotaCost) {
  return q.related_resources?.find((r) => r.billing_model === "marketplace");
}

export const useStandardQuota = () => {
  const getApi = useAms();
  return useCallback(async () => {
    const api = getApi();
    const account = await api.apiAccountsMgmtV1CurrentAccountGet();
    const orgId = account?.data?.organization?.id;
    if (!orgId) {
      throw new Error("User has no organization id");
    }
    const quotaResponse =
      await api.apiAccountsMgmtV1OrganizationsOrgIdQuotaCostGet(
        orgId,
        undefined,
        true,
        undefined,
        true
      );
    if (quotaResponse.status !== 200) {
      throw new Error(quotaResponse.statusText);
    }
    const standardQuotas = quotaResponse.data.items?.filter((q) =>
      q.related_resources?.find(
        (r) => r.resource_name === resourceName && r.product === standardId
      )
    );

    const prepaidQuota = standardQuotas?.find(isStandardQuota);

    const marketplaceQuotas = standardQuotas?.some(isMarketplaceQuota)
      ? standardQuotas?.filter(isMarketplaceQuota)
      : undefined;

    const hasTrialQuota =
      (prepaidQuota === undefined &&
        marketplaceQuotas === undefined &&
        quotaResponse.data.items?.some((q) =>
          q.related_resources?.find(
            (r) => r.resource_name === resourceName && r.product === developerId
          )
        )) ||
      false;

    const remainingPrepaidQuota = prepaidQuota
      ? prepaidQuota.allowed - prepaidQuota.consumed
      : undefined;
    const remainingMarketplaceQuota = marketplaceQuotas
      ? marketplaceQuotas.reduce((agg, q) => q.allowed - q.consumed + agg, 0)
      : undefined;
    const unaggregatedSubscriptions = marketplaceQuotas
      ?.filter((q) => q.cloud_accounts !== undefined)
      .flatMap((q) => q.cloud_accounts!);
    const subscriptionMarketplaces = Array.from(
      new Set(
        unaggregatedSubscriptions?.map(
          (s) => s.cloud_provider_id as MarketPlace
        )
      )
    );
    const marketplaceSubscriptions: MarketPlaceSubscriptions[] =
      unaggregatedSubscriptions
        ? subscriptionMarketplaces.map((marketplace) => ({
            marketplace,
            subscriptions: unaggregatedSubscriptions
              .filter((s) => s.cloud_provider_id === marketplace)
              .map((s) => s.cloud_account_id!),
          }))
        : [];

    return {
      hasTrialQuota,
      remainingPrepaidQuota,
      remainingMarketplaceQuota,
      marketplaceSubscriptions,
    };
  }, [getApi]);
};

export const useCheckStandardQuota =
  (): CreateKafkaInstanceServices["checkStandardQuota"] => {
    const getQuota = useStandardQuota();
    const checkStandardQuota: CreateKafkaInstanceServices["checkStandardQuota"] =
      useCallback(
        async ({ onNoQuotaAvailable, onOutOfQuota, onQuotaAvailable }) => {
          try {
            const {
              hasTrialQuota,
              remainingPrepaidQuota,
              remainingMarketplaceQuota,
              marketplaceSubscriptions,
            } = await getQuota();

            if (
              remainingMarketplaceQuota !== undefined ||
              remainingPrepaidQuota !== undefined
            ) {
              if (
                (remainingMarketplaceQuota || 0) === 0 &&
                (remainingPrepaidQuota || 0) === 0
              ) {
                onOutOfQuota({
                  quota: {
                    marketplaceSubscriptions,
                  },
                });
              } else {
                onQuotaAvailable({
                  quota: {
                    remainingPrepaidQuota,
                    remainingMarketplaceQuota,
                    marketplaceSubscriptions,
                  },
                });
              }
            } else {
              onNoQuotaAvailable({ hasTrialQuota });
            }
          } catch (e) {
            onNoQuotaAvailable({ hasTrialQuota: false });
          }
        },
        [getQuota]
      );
    return checkStandardQuota;
  };

export const useCheckDeveloperAvailability =
  (): CreateKafkaInstanceServices["checkDeveloperAvailability"] => {
    const { getUsername } = useAuth();
    const getApi = useKms();
    const checkDeveloperAvailability: CreateKafkaInstanceServices["checkDeveloperAvailability"] =
      useCallback(
        async ({ onAvailable, onUnavailable, onUsed }) => {
          try {
            const api = getApi();
            const loggedInUser = await getUsername();
            const filter = `owner = ${loggedInUser}`;

            const res = await api.getKafkas("", "", "", filter);
            if (res.data.items) {
              const hasTrialRunning = res.data.items.some(
                (k) =>
                  k?.instance_type === InstanceType?.eval ||
                  k?.instance_type === InstanceType?.developer
              );
              if (hasTrialRunning) {
                onUsed();
              } else {
                onAvailable();
              }
            }
          } catch (e) {
            onUnavailable();
          }
        },
        [getApi, getUsername]
      );
    return checkDeveloperAvailability;
  };

export const useFetchProvidersWithRegions =
  (): CreateKafkaInstanceServices["fetchProvidersWithRegions"] => {
    const getApi = useKms();
    const fetchRegions = useFetchProviderRegions();
    const fetchProvidersWithRegions: CreateKafkaInstanceServices["fetchProvidersWithRegions"] =
      useCallback(
        async (plan, { onAvailable, onUnavailable }) => {
          try {
            const api = getApi();
            const res = await api.getCloudProviders();
            const allProviders = res?.data?.items || [];

            const providers = await Promise.all(
              allProviders
                .filter((p) => p.enabled)
                .map(async (provider) => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const regions = await fetchRegions(provider.id!, plan);
                  const providerInfo: CloudProviderInfo = {
                    id: provider.id as CloudProvider,
                    displayName: provider.display_name!,
                    regions,
                  };
                  return providerInfo;
                })
            );
            const firstProvider = providers[0];
            onAvailable({ providers, defaultProvider: firstProvider?.id });
          } catch (e) {
            onUnavailable();
          }
        },
        [fetchRegions, getApi]
      );
    return fetchProvidersWithRegions;
  };

export const useFetchProviderRegions = () => {
  const getApi = useKms();
  return useCallback(
    async function fetchProviderRegions(
      provider: string,
      instanceType: string
    ): Promise<Array<RegionInfo & Pick<CloudRegion, "capacity">>> {
      const api = getApi();
      const res = await api.getCloudProviderRegions(provider);

      if (!res?.data?.items) {
        return [];
      }

      const regionsForInstance = res.data.items.filter(
        (region) =>
          region.enabled &&
          region.capacity.some((c) => c.instance_type === instanceType)
      );

      return regionsForInstance.map((r) => {
        const max_capacity_reached = r.capacity?.some(
          (c) =>
            c.instance_type === instanceType && c.available_sizes?.length === 0
        );

        return {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: r.id!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          displayName: r.display_name!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          isDisabled: max_capacity_reached,
          capacity: r.capacity,
        };
      });
    },
    [getApi]
  );
};

export const useGetSizes = (instanceType: "developer" | "standard") => {
  const getApi = useKms();
  const fetchRegions = useFetchProviderRegions();
  return useCallback(
    async (provider: CloudProvider, region: string) => {
      const api = getApi();
      const regions = await fetchRegions(provider, instanceType);
      const regionInfo = regions.find((r) => r.id === region);
      const availableSizes =
        regionInfo?.capacity.flatMap((c) =>
          c.available_sizes.map((s) => `${c.instance_type}.${s}`)
        ) || [];
      const sizes = await api.getInstanceTypesByCloudProviderAndRegion(
        provider,
        region
      );
      if (!sizes?.data?.instance_types) {
        throw new Error(`No instance_types from backend`);
      }

      const standardSizes =
        sizes?.data?.instance_types.find((i) => i.id === instanceType)?.sizes ||
        [];

      return standardSizes.map(
        apiSizeToComponentSize.bind(
          undefined,
          (id) => !availableSizes.includes(`${instanceType}.${id}`)
        )
      );
    },
    [fetchRegions, getApi, instanceType]
  );
};

export const useGetStandardSizes =
  (): CreateKafkaInstanceServices["getStandardSizes"] => {
    const getSizes = useGetSizes("standard");
    return getSizes;
  };

export const useGetTrialSizes =
  (): CreateKafkaInstanceServices["getTrialSizes"] => {
    const getStandardSizes = useGetSizes("standard");
    const getDeveloperSizes = useGetSizes("developer");
    return useCallback(
      async (provider, region) => {
        let standardSizes: StandardSizes;
        try {
          standardSizes = await getStandardSizes(provider, region);
        } catch (e) {
          // It can happen that the selected provider doesn't support standard instances.
          // In this case we provide a faux sample list of sizes just to make the slider happy.
          standardSizes = [
            { id: "1", displayName: "1" },
            { id: "2", displayName: "2" },
          ] as StandardSizes;
        }
        const trialSizes = await getDeveloperSizes(provider, region);
        return {
          standard: standardSizes,
          trial: trialSizes[0],
        };
      },
      [getDeveloperSizes, getStandardSizes]
    );
  };

function apiSizeToComponentSize(
  isDisabled: (id: string) => boolean,
  apiSize: SupportedKafkaSize
): Size & { trialDurationHours: number } {
  const s = apiSize as Required<SupportedKafkaSize>;
  return {
    id: s.id,
    displayName: s.display_name,
    quota: s.quota_consumed,
    ingress: (s.ingress_throughput_per_sec.bytes || 0) / 1048576,
    egress: (s.egress_throughput_per_sec.bytes || 0) / 1048576,
    storage: Math.round((s.max_data_retention_size.bytes || 0) / 1073741824),
    connections: s.total_max_connections,
    connectionRate: s.max_connection_attempts_per_sec,
    maxPartitions: s.max_partitions,
    messageSize: (s.max_message_size.bytes || 0) / 1048576,
    status: s.maturity_status === "stable" ? "stable" : "preview",
    trialDurationHours: s.lifespan_seconds ? s.lifespan_seconds / 60 / 60 : 0,
    isDisabled: isDisabled(s.id),
  };
}
