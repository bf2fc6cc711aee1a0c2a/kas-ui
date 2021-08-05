import React, { useContext } from 'react';

export type Quota =
  | {
      allowed: number;
      consumed: number;
      remaining: number;
      isTrial: boolean;
      isServiceDown: boolean;
    }
  | undefined;

export type QuotaContextProps = {
  getQuota: () => Promise<Quota | undefined>;
};

export type FederatedProps = QuotaContextProps & {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal?: boolean;
};

const initialState: FederatedProps = {
  tokenEndPointUrl: '',
  getQuota: () => Promise.resolve(undefined),
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
