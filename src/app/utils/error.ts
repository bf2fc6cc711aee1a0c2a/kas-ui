import {
  APIErrorCodes,
  isServiceApiError,
  getErrorCode,
} from '@rhoas/kafka-management-sdk';

const ErrorCodes = {
  /** Forbidden to perform this action*/
  UNAUTHORIZED_USER: APIErrorCodes.ERROR_4,
  /** Kafka cluster name is already used*/
  DUPLICATE_INSTANCE_NAME: APIErrorCodes.ERROR_36,
  /** The maximum number of allowed kafka instances has been reached*/
  REACHED_MAX_LIMIT_ALLOWED_KAFKA: APIErrorCodes.ERROR_24,
  /** Insufficient quota*/
  INSUFFICIENT_QUOTA: APIErrorCodes.ERROR_120,
  /** Failed to check quota*/
  FAILED_TO_CHECK_QUOTA: APIErrorCodes.ERROR_121,
  /** Bad request*/
  OWNER_DOES_NOT_EXIST: APIErrorCodes.ERROR_21,
  /** Instance Type not supported*/
  INSTANCE_TYPE_NOT_SUPPORTED: APIErrorCodes.ERROR_41,
};

export { ErrorCodes, isServiceApiError, getErrorCode };
