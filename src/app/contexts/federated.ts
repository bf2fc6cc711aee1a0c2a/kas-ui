import React, { useContext } from 'react';

export type QuotaValue = {
  allowed: number;
  consumed: number;
  remaining: number;
};

export enum QuotaType {
  kas = 'kas',
  kasTrial = 'kas-trial',
}

export enum ProductType {
  kas = 'kas',
}

export type Quota = {
  data: Map<QuotaType, QuotaValue> | undefined;
  loading: boolean;
  isServiceDown: boolean;
};

export type FederatedProps = {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
  getQuota: () => Promise<Quota>;
};

export const FederatedContext = React.createContext<FederatedProps | undefined>(undefined);
export const useFederated = (): FederatedProps | undefined => useContext(FederatedContext);
