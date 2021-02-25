import { AxiosError } from 'axios';

export interface IApiErrorData {
  code: string;
  href: string
  id: number
  kind: string
  reason: string
}

const isServiceApiError = (error: Error): error is AxiosError<IApiErrorData> => {
  return (error as AxiosError<IApiErrorData>).response?.data.code !== undefined;
}

enum ErrorCodes {
  UNAUTHORIZED_USER = "MGD-SERV-API-4"
}

export {
  ErrorCodes,
  isServiceApiError
}
