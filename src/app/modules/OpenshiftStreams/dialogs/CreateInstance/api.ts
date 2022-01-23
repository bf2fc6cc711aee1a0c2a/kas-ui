import {
  InitializationData,
  InstanceType,
  Provider,
  ProviderCapabilities,
  Providers,
} from '@rhoas/app-services-ui-components';
import {
  Quota,
  QuotaType,
  QuotaValue,
  useAuth,
  useConfig,
  useQuota,
} from '@rhoas/app-services-ui-shared';
import {
  CloudProvider,
  Configuration,
  DefaultApi,
} from '@rhoas/kafka-management-sdk';

export const useAvailableProvidersAndDefault = () => {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { getQuota } = useQuota();

  // Function to fetch cloud Regions based on selected filter
  const fetchCloudRegions = async (
    id: string,
    isKasTrial: boolean
  ): Promise<ProviderCapabilities['regions']> => {
    const accessToken = await auth?.kas.getToken();
    const regions: ProviderCapabilities['regions'] = {};
    const apisService = new DefaultApi(
      new Configuration({
        accessToken,
        basePath,
      })
    );
    const res = await apisService.getCloudProviderRegions(
      id,
      undefined,
      undefined,
      isKasTrial ? InstanceType.eval : InstanceType.standard
    );
    res.data.items
      ?.filter((p) => p.enabled)
      .forEach((r) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        regions[r.id!] = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          displayValue: r.display_name!,
        };
      });

    return regions;
  };

  const fetchQuota = async (): Promise<Quota['data']> => {
    return new Promise((resolve, reject) => {
      async function getQuotaData() {
        const quota = await getQuota();
        if (quota.isServiceDown) {
          reject();
        } else if (quota.loading) {
          setTimeout(getQuota, 1000);
        } else {
          resolve(quota.data);
        }
      }
      getQuotaData();
    });
  };

  const fetchCloudProviders = async (
    isKasTrial: boolean
  ): Promise<Providers> => {
    const providers: Providers = {};

    const accessToken = await auth?.kas.getToken();
    const apisService = new DefaultApi(
      new Configuration({
        accessToken,
        basePath,
      })
    );
    const res = await apisService.getCloudProviders();
    const allProviders = res?.data?.items || [];
    await Promise.all(
      allProviders
        ?.filter((p: CloudProvider) => p.enabled)
        .map(async (provider) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          providers[provider.id! as Provider] = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            regions: await fetchCloudRegions(provider.id!, isKasTrial),
            AZ: {
              single: false,
              multi: true,
            },
          };
        })
    );

    return providers;
  };

  // const fetchUserHasTrialInstance = async () => {
  //   const loggedInUser = await auth?.getUsername();
  //   const accessToken = await auth?.kas.getToken();
  //   if (loggedInUser) {
  //     const filter = `owner = ${loggedInUser}`;
  //     if (accessToken && isVisible) {
  //       try {
  //         const apisService = new DefaultApi(
  //           new Configuration({
  //             accessToken,
  //             basePath,
  //           })
  //         );
  //         const res = await apisService.getKafkas("", "", "", filter);
  //         if (res.data.items) {
  //           setUserHasTrialInstance(
  //             res.data.items.some(
  //               (k) => k?.instance_type === InstanceType?.eval
  //             )
  //           );
  //         }
  //       } catch (error) {
  //         handleServerError(error);
  //       }
  //     }
  //   }
  // };

  // const handleServerError = (error: unknown) => {
  //   let reason: string | undefined;
  //   if (isServiceApiError(error)) {
  //     reason = error.response?.data.reason;
  //   }
  // };

  return async function (): Promise<InitializationData> {
    const quota = await fetchQuota();
    const kasQuota: QuotaValue | undefined = quota?.get(QuotaType?.kas);
    const kasTrial: QuotaValue | undefined = quota?.get(QuotaType?.kasTrial);
    const isKasTrial = kasTrial !== undefined && kasQuota === undefined;

    const availableProviders = await fetchCloudProviders(isKasTrial);
    const defaultProvider = Object.keys(availableProviders)[0] as Provider;
    const defaultRegion = Object.keys(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      availableProviders[defaultProvider]!.regions
    )[0];

    const data: InitializationData = {
      defaultProvider,
      defaultRegion,
      defaultAZ: 'multi',
      availableProviders,
      instanceAvailability: kasTrial ? 'trial' : kasQuota ? 'quota' : 'none',
    };
    console.log(data);
    return data;
  };
};

// const createInstance = async () => {
//   const accessToken = await auth?.kas.getToken();

//   if (accessToken) {
//     try {
//       const apisService = new DefaultApi(
//         new Configuration({
//           accessToken,
//           basePath,
//         })
//       );

//       setCreationInProgress(true);
//       onCreate && onCreate();
//       await apisService.createKafka(true, asKafkaRequestPayload(kafkaRequest));
//       hideModal();
//       onCreate && onCreate();
//     } catch (error) {
//       if (isServiceApiError(error)) {
//         const { code, reason } = error?.response?.data || {};
//         //if instance name duplicate
//         if (code === ErrorCodes.DUPLICATE_INSTANCE_NAME) {
//           kafkaRequest.name.validated = "error";
//           kafkaRequest.name.errorMessage = t(
//             "the_name_already_exists_please_enter_a_unique_name",
//             {
//               name: kafkaRequest.name.value,
//             }
//           );
//         }
//         //if kafka creation failed due to quota
//         else if (
//           code === ErrorCodes.PREVIEW_KAFKA_INSTANCE_EXIST ||
//           code === ErrorCodes.INSUFFICIENT_QUOTA ||
//           code === ErrorCodes.FAILED_TO_CHECK_QUOTA
//         ) {
//           setHasKafkaCreationFailed(true);
//         } else {
//           addAlert &&
//             addAlert({
//               title: t("common.something_went_wrong"),
//               variant: AlertVariant.danger,
//               description: reason,
//               dataTestId: "toastCreateKafka-failed",
//             });
//         }
//       }
//       setCreationInProgress(false);
//     }
//   }
// };
