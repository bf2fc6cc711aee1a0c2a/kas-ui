import { AxiosError } from 'axios';
import { AlertVariant } from '@patternfly/react-core';

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
  UNAUTHORIZED_USER = "MGD-SERV-API-4",
  DUPLICATE_INSTANCE_NAME = "MGD-SERV-API-36"
}

type ServerError = {
  error: any,
  addAlert: Function,
  setState?: (state: boolean) => void,
  errorCode?: string,
  alertVariant?: string;
  message: string
}

const serverError = ({ error, addAlert, errorCode, setState, alertVariant = AlertVariant.danger, message }: ServerError) => {
  let reason: string | undefined;
  let code: string | undefined;
  if (isServiceApiError(error)) {
    reason = error.response?.data.reason;
    code = error.response?.data?.code;
  }
  if (code === errorCode) {
    setState && setState(true);
  } else {
    addAlert(message, alertVariant, reason);
  }
};

export {
  ErrorCodes,
  isServiceApiError,
  serverError
}
