import React, { useContext } from 'react';

export type QuotaCost = {
  allowed: number | undefined;
  consumed: number | undefined;
  href: string | undefined;
  kind: string | undefined;
  organization_id: string | undefined;
  quota_id: string | undefined;
  isAMSServiceDown: boolean;
};

export const initialQuotaCost: QuotaCost = {
  allowed: undefined,
  consumed: undefined,
  href: '',
  kind: '',
  organization_id: '',
  quota_id: '',
  isAMSServiceDown: false,
};

export type FederatedProps = {
  getAMSQuotaCost?: () => Promise<QuotaCost>;
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal?: boolean;
};

const initialState: FederatedProps = {
  getAMSQuotaCost: () => Promise.resolve(initialQuotaCost),
  tokenEndPointUrl: '',
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
