import {
  asKafkaRequestPayload,
  createEmptyNewKafkaRequestPayload,
} from "@app/models/kafka";
import { CreateKafkaInstanceWithSizesTypes } from "@rhoas/app-services-ui-components";
import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";
import { isServiceApiError } from "@app/utils/error";
import { ErrorCodes } from "@app/utils";
import { convertQuotaToInstanceType, useAMSQuota } from "./useAMSQuota";

/**
 * Create Kafka instance hook that creates kafka instance
 * @param currentAMSPlan
 * @returns
 */
export const useCreateInstance =
  (): CreateKafkaInstanceWithSizesTypes.OnCreateKafka => {
    const auth = useAuth();
    const getQuota = useAMSQuota();
    const {
      kas: { apiBasePath: basePath },
    } = useConfig();

    return async (data, onSuccess, onError) => {
      const apisService = new DefaultApi(
        new Configuration({
          accessToken: auth?.kas.getToken(),
          basePath,
        })
      );
      const quota = await getQuota();
      const instanceType = convertQuotaToInstanceType(quota.data);

      try {
        const kafkaRequest = asKafkaRequestPayload(
          createEmptyNewKafkaRequestPayload()
        );
        kafkaRequest.name = data.name;
        kafkaRequest.cloud_provider = data.provider;
        kafkaRequest.region = data.region;
        kafkaRequest.plan = instanceType + "." + data.sizeId;
        await apisService.createKafka(true, kafkaRequest);
        onSuccess();
      } catch (error) {
        if (isServiceApiError(error)) {
          const { code } = error?.response?.data || {};

          switch (instanceType) {
            case "developer":
              switch (code) {
                case ErrorCodes.DUPLICATE_INSTANCE_NAME:
                  onError("name-taken");
                  break;

                // regardless of the error, let's not give too many details to trial users
                default:
                  onError("trial-unavailable");
                  break;
              }
              break;

            case "standard":
              switch (code) {
                case ErrorCodes.DUPLICATE_INSTANCE_NAME:
                  onError("name-taken");
                  break;

                case ErrorCodes.INTERNAL_CAPACITY_ERROR:
                  onError("region-unavailable");
                  break;

                case ErrorCodes.INSUFFICIENT_QUOTA:
                  onError("over-quota");
                  break;

                default:
                  console.error(
                    "useAvailableProvidersAndDefault",
                    "createKafka unknown error",
                    error
                  );
                  onError("unknown");
              }
              break;
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
