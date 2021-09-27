import { Validated } from '@app/models/validated';
import { ServiceAccountRequest } from '@rhoas/kafka-management-sdk';

export type NewServiceAccountRequest = {
  name: Validated<string | undefined>;
  description: Validated<string | undefined>;
};

export const asServiceAccountRequest = (
  value: NewServiceAccountRequest
): ServiceAccountRequest => {
  if (value.name.value === undefined) {
    throw new Error('ServiceAccountRequest.name must not be undefined');
  }
  if (value.description.value === undefined) {
    throw new Error('ServiceAccountRequest.description must not be undefined');
  }
  return {
    name: value.name.value,
    description: value.description.value,
  };
};

export const isServiceAccountRequestValidated = (
  value: NewServiceAccountRequest
): boolean => {
  return (
    value.name.validated === 'success' &&
    value.description.validated !== 'error'
  );
};

export const isServiceAccountRequestInvalid = (
  value: NewServiceAccountRequest
): boolean => {
  return (
    value.name.validated === 'error' || value.description.validated === 'error'
  );
};

export const createEmptyNewServiceAccountRequest =
  (): NewServiceAccountRequest => {
    return {
      name: {
        value: '',
      },
      description: {
        value: '',
      },
    };
  };
