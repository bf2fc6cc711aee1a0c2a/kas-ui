import { AxiosError } from 'axios';

export interface IApiErrorData {
  code: string;
  href: string;
  id: number;
  kind: string;
  reason: string;
}

const isServiceApiError = (error: Error): error is AxiosError<IApiErrorData> => {
  return (error as AxiosError<IApiErrorData>).response?.data.code !== undefined;
};

enum ErrorCodes {
  UNAUTHORIZED_USER = 'KAFKAS-MGMT-4',
  DUPLICATE_INSTANCE_NAME = 'KAFKAS-MGMT-36',
  PREVIEW_KAFKA_INSTANCE_EXIST = 'KAFKAS-MGMT-24',
}

export { ErrorCodes, isServiceApiError };
