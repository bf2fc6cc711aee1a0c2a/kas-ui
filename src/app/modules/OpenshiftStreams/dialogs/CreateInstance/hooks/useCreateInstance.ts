import {
  asKafkaRequestPayload,
  createEmptyNewKafkaRequestPayload,
} from "@app/models/kafka";
import { CreateKafkaInstanceServices } from "@rhoas/app-services-ui-components";
import { isServiceApiError } from "@app/utils/error";
import { ErrorCodes } from "@app/utils";
import { useKms } from "@app/api";

/**
 * Create Kafka instance hook that creates kafka instance
 * @param currentAMSPlan
 * @returns
 */
export const useCreateInstance =
  (): CreateKafkaInstanceServices["onCreate"] => {
    const getApi = useKms();

    return async (data, onSuccess, onError) => {
      const apisService = getApi();

      try {
        const kafkaRequest = asKafkaRequestPayload(
          createEmptyNewKafkaRequestPayload()
        );
        kafkaRequest.name = data.name;
        kafkaRequest.cloud_provider = data.provider;
        kafkaRequest.region = data.region;
        kafkaRequest.plan = data.plan + "." + data.sizeId;
        kafkaRequest.billing_model =
          data.billing === "prepaid"
            ? "standard"
            : data.billing !== undefined
            ? "marketplace"
            : null;
        kafkaRequest.billing_cloud_account_id =
          data.billing && data.billing !== "prepaid"
            ? data.billing.subscription
            : null;
        await apisService.createKafka(true, kafkaRequest);
        onSuccess();
      } catch (error) {
        if (isServiceApiError(error)) {
          const { code } = error?.response?.data || {};

          switch (data.plan) {
            case "developer":
              switch (code) {
                case ErrorCodes.DUPLICATE_INSTANCE_NAME:
                  onError("name-taken");
                  break;

                // regardless of the error, let's not give too many details to trial users
                default:
                  onError("developer-unavailable");
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
                  onError("insufficient-quota");
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
