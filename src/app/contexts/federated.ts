import React, { useContext } from 'react';

export type QuotaCost = {
  allowed: number | undefined;
  consumed: number | undefined;
};

export type FederatedProps = {
  getAMSQuotaCost?: () => Promise<QuotaCost>;
  tokenEndPointUrl: string;
};

const initialState: FederatedProps = {
  getAMSQuotaCost: () => Promise.resolve({ allowed: undefined, consumed: undefined }),
  tokenEndPointUrl: '',
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
