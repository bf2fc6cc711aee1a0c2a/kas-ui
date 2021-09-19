import React, { useContext } from 'react';

export type FederatedProps = {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
};

export const FederatedContext = React.createContext<FederatedProps | undefined>(
  undefined
);
export const useFederated = (): FederatedProps | undefined =>
  useContext(FederatedContext);
