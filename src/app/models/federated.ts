import React, { useContext } from 'react';

export type FederatedProps = {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal?: boolean;
};

const initialState: FederatedProps = {
  tokenEndPointUrl: '',
};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
