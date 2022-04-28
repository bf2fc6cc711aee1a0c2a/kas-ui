import {
  asKafkaRequestPayload,
  createEmptyNewKafkaRequestPayload,
} from "@app/models/kafka";
import {
  CreateKafkaInitializationData,
  InstanceAvailability,
  OnCreateKafka,
  Provider,
  ProviderInfo,
  Providers,
  RegionInfo,
  Regions,
} from "@rhoas/app-services-ui-components";
import {
  Quota,
  QuotaType,
  QuotaValue,
  useAuth,
  useConfig,
  useQuota,
} from "@rhoas/app-services-ui-shared";
import {
  CloudRegion,
  Configuration,
  DefaultApi,
} from "@rhoas/kafka-management-sdk";
import { isServiceApiError } from "@app/utils/error";
import { ErrorCodes, InstanceType } from "@app/utils";

export const useAvailableProvidersAndDefault = () => {
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { getQuota } = useQuota();

  const apisService = new DefaultApi(
    new Configuration({
      accessToken: auth.kas.getToken(),
      basePath,
    })
  );

  const fetchQuota = async (): Promise<Quota["data"]> => {
    return new Promise((resolve, reject) => {
      async function getQuotaData() {
        const quota = await getQuota();
        if (quota.isServiceDown) {
          console.error(
            "useAvailableProvidersAndDefault",
            "fetchQuota rejected because isServiceDown is true"
          );
          reject();
        } else if (quota.loading) {
          console.warn(
            "useAvailableProvidersAndDefault",
            "fetchQuota",
            "quota is loading, retrying in 1000ms"
          );
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
    ia: InstanceAvailability
  ): Promise<Regions> => {
    const res = await apisService.getCloudProviderRegions(id);

    if (!res?.data?.items) {
      return [];
    }

    const instance_type =
      ia === "quota"
        ? InstanceType.standard
        : getInstanceTypeForResponse(res.data.items);

    const regionsForInstance = res.data.items.filter(
      (p) =>
        p.enabled && p.capacity.some((c) => c.instance_type === instance_type)
    );

    return regionsForInstance.map((r): RegionInfo => {
      let max_capacity_reached = false;
      // Backwards compatibility remove once eval type is removed
      if (instance_type == InstanceType.eval) {
        max_capacity_reached = r.capacity?.some(
          (c) => c.max_capacity_reached === true
        );
      } else {
        max_capacity_reached = r.capacity?.some(
          (c) => c.available_sizes?.length === 0
        );
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
    ia: InstanceAvailability
  ): Promise<Providers> => {
    try {
      const res = await apisService.getCloudProviders();
      const allProviders = res?.data?.items || [];
      return await Promise.all(
        allProviders
          .filter((p) => p.enabled)
          .map(async (provider): Promise<ProviderInfo> => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const regions = await fetchRegions(provider.id!, ia);
            return {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              id: provider.id!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              displayName: provider.display_name!,
              regions,
              AZ: {
                single: false,
                multi: true,
              },
            };
          })
      );
    } catch (e) {
      console.error("useAvailableProvidersAndDefault", "fetchProvider", e);
      return Promise.reject(e);
    }
  };

  const fetchUserHasTrialInstance = async (): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const loggedInUser = await auth.getUsername()!;
      const accessToken = await auth.kas.getToken();
      const filter = `owner = ${loggedInUser}`;
      const apisService = new DefaultApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );
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

  return async function (): Promise<CreateKafkaInitializationData> {
    try {
      const quota = await fetchQuota();
      const hasTrialRunning = await fetchUserHasTrialInstance();

      let kasQuota: QuotaValue | undefined;
      try {
        kasQuota = quota?.get(QuotaType?.kas);
      } catch (e) {
        console.error(
          "useAvailableProvidersAndDefault",
          "quota?.get exception",
          e
        );
      }

      const instanceAvailability = ((): InstanceAvailability => {
        switch (true) {
          case kasQuota !== undefined && kasQuota.remaining > 0:
            return "quota";
          case kasQuota !== undefined && kasQuota.remaining === 0:
            return "over-quota";
          case hasTrialRunning:
            return "trial-used";
          // TODO check if trial instances are available for creation using the info returned by the region endpoint
          // TODO also check if there is any capacity for standard instances, as for the trial ones
          default:
            return "trial";
        }
      })();

      const availableProviders = await fetchProviders(instanceAvailability);
      let defaultProvider: Provider | undefined;
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

      return {
        defaultProvider,
        defaultAZ: "multi",
        availableProviders,
        instanceAvailability,
      };
    } catch (e) {
      console.error("useAvailableProvidersAndDefault", e);
      return Promise.reject(e);
    }
  };
};

export const useCreateInstance = (): OnCreateKafka => {
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  const apisService = new DefaultApi(
    new Configuration({
      accessToken: auth?.kas.getToken(),
      basePath,
    })
  );

  return async (data, onSuccess, onError) => {
    try {
      const kafkaRequest = asKafkaRequestPayload(
        createEmptyNewKafkaRequestPayload()
      );
      kafkaRequest.name = data.name;
      kafkaRequest.cloud_provider = data.provider;
      kafkaRequest.region = data.region;
      kafkaRequest.multi_az = data.az === "multi";
      await apisService.createKafka(true, kafkaRequest);
      onSuccess();
    } catch (error) {
      if (isServiceApiError(error)) {
        const { code } = error?.response?.data || {};

        switch (code) {
          case ErrorCodes.DUPLICATE_INSTANCE_NAME:
            onError("name-taken");
            break;
          case ErrorCodes.INSUFFICIENT_QUOTA:
            onError("over-quota");
            break;
          case ErrorCodes.REACHED_MAX_LIMIT_ALLOWED_KAFKA:
          case ErrorCodes.INSTANCE_TYPE_NOT_SUPPORTED:
            onError("trial-unavailable");
            break;
          default:
            console.error(
              "useAvailableProvidersAndDefault",
              "createKafka unknown error",
              error
            );
            onError("unknown");
        }
      } else {
        console.error(
          "useAvailableProvidersAndDefault",
          "createKafka unexpected error",
          error
        );
      }
    }
  };
};
