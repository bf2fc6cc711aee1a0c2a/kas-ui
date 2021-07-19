import React, { useContext } from 'react';

export type FederatedProps = {
  getAMSQuotaCost?: () => Promise<unknown>;
};

const initialState: FederatedProps = {
  getAMSQuotaCost: () => Promise.resolve({}),
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
