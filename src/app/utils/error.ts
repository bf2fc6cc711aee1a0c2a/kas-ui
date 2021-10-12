import { AxiosError } from 'axios';

export interface IApiErrorData {
  code: string;
  href: string;
  id: number;
  kind: string;
  reason: string;
}

const isServiceApiError = (
  error: unknown
): error is AxiosError<IApiErrorData> => {
  return (error as AxiosError<IApiErrorData>).response?.data.code !== undefined;
};

enum ErrorCodes {
  UNAUTHORIZED_USER = 'KAFKAS-MGMT-4',
  DUPLICATE_INSTANCE_NAME = 'KAFKAS-MGMT-36',
  PREVIEW_KAFKA_INSTANCE_EXIST = 'KAFKAS-MGMT-24',
  INSUFFICIENT_QUOTA = 'KAFKAS-MGMT-120',
  FAILED_TO_CHECK_QUOTA = 'KAFKAS-MGMT-121',
  OWNER_DOES_NOT_EXIST = 'KAFKAS-MGMT-21',
}

export { ErrorCodes, isServiceApiError };
