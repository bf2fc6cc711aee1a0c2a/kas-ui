import React, { useContext } from 'react';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export type FederatedProps = {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
  getKafkaInstance?: (kafka: KafkaRequest) => void;
};

export const FederatedContext = React.createContext<FederatedProps | undefined>(
  undefined
);
export const useFederated = (): FederatedProps | undefined =>
  useContext(FederatedContext);
