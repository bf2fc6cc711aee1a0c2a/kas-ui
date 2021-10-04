import { Validated } from '@app/models/validated';
import { ServiceAccountRequest } from '@rhoas/kafka-management-sdk';

export type NewServiceAccountRequest = {
  name: Validated<string | undefined>;
};

export const asServiceAccountRequest = (
  value: NewServiceAccountRequest
): ServiceAccountRequest => {
  if (value.name.value === undefined) {
    throw new Error('ServiceAccountRequest.name must not be undefined');
  }
  return {
    name: value.name.value,
  };
};

export const isServiceAccountRequestValidated = (
  value: NewServiceAccountRequest
): boolean => {
  return value.name.validated === 'success';
};

export const isServiceAccountRequestInvalid = (
  value: NewServiceAccountRequest
): boolean => {
  return value.name.validated === 'error';
};

export const createEmptyNewServiceAccountRequest =
  (): NewServiceAccountRequest => {
    return {
      name: {
        value: '',
      },
    };
  };
