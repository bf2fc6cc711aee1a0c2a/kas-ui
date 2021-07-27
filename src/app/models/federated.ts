import React, { useContext } from 'react';

export type FederatedProps = {
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal?: boolean;
};

const initialState: FederatedProps = {};

export const FederatedContext = React.createContext<FederatedProps>(initialState);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
