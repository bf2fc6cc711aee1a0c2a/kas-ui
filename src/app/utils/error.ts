import { AxiosError } from 'axios';

export interface IApiErrorData {
  code: string;
  href: string
  id: number
  kind: string
  reason: string
}

export const isServiceApiError = (error: Error): error is AxiosError<IApiErrorData> => {
  return (error as AxiosError<IApiErrorData>).response?.data.code !== undefined;
}
