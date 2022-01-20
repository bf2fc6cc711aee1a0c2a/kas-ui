import {
  APIErrorCodes,
  isServiceApiError,
  getErrorCode,
} from '@rhoas/kafka-management-sdk';

const ErrorCodes = {
  UNAUTHORIZED_USER: APIErrorCodes.ERROR_4,
  DUPLICATE_INSTANCE_NAME: APIErrorCodes.ERROR_36,
  PREVIEW_KAFKA_INSTANCE_EXIST: APIErrorCodes.ERROR_24,
  INSUFFICIENT_QUOTA: APIErrorCodes.ERROR_120,
  FAILED_TO_CHECK_QUOTA: APIErrorCodes.ERROR_121,
  OWNER_DOES_NOT_EXIST: APIErrorCodes.ERROR_21,
};

export { ErrorCodes, isServiceApiError, getErrorCode };
