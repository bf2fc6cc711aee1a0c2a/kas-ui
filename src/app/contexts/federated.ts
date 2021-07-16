import React, { useContext } from 'react';
import { QuotaCostList } from '@app/models';

export type FederatedProps = {
  getAMSQuotaCost?: () => Promise<QuotaCostList>;
};

const initialState: FederatedProps = {
  getAMSQuotaCost: () => Promise.resolve({} as QuotaCostList),
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
