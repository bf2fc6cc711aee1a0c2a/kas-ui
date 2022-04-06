import { KafkaRequestPayload } from "@rhoas/kafka-management-sdk";
import { Validated } from "@app/models/validated";

export type NewKafkaRequestPayload = {
  cloud_provider: Validated<string | undefined>;
  multi_az: Validated<boolean | undefined>;
  region: Validated<string | undefined>;
  name: Validated<string | undefined>;
};

export const asKafkaRequestPayload = (
  kafkaRequest: NewKafkaRequestPayload
): KafkaRequestPayload => {
  if (kafkaRequest.name.value === undefined) {
    throw new Error("kafkaRequest.name must not be undefined");
  }
  if (kafkaRequest.region.value === undefined) {
    throw new Error("kafkaRequest.region must not be undefined");
  }
  if (kafkaRequest.multi_az.value === undefined) {
    throw new Error("kafkaRequest.multi_az must not be undefined");
  }
  if (kafkaRequest.cloud_provider.value === undefined) {
    throw new Error("kafkaRequest.cloud_provider must not be undefined");
  }
  return {
    name: kafkaRequest.name.value,
    region: kafkaRequest.region.value,
    multi_az: kafkaRequest.multi_az.value,
    cloud_provider: kafkaRequest.cloud_provider.value,
  };
};

export const isKafkaRequestInvalid = (
  value: NewKafkaRequestPayload
): boolean => {
  return (
    value.name.validated === "error" ||
    value.region.validated === "error" ||
    value.cloud_provider.validated === "error" ||
    value.multi_az.validated === "error"
  );
};

export const createEmptyNewKafkaRequestPayload = (): NewKafkaRequestPayload => {
  return {
    cloud_provider: {
      value: "",
    },
    multi_az: {
      value: true,
    },
    region: {
      value: "",
    },
    name: {
      value: "",
    },
  };
};
