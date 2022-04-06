import React, { useContext } from "react";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";
import { Principal } from "@rhoas/app-services-ui-shared";

export type FederatedProps = {
  tokenEndPointUrl: string;
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
  setKafkaInstance?: (kafka: KafkaRequest) => void;
  getAllUserAccounts?: () => Principal[];
};

export const FederatedContext = React.createContext<FederatedProps | undefined>(
  undefined
);
export const useFederated = (): FederatedProps | undefined =>
  useContext(FederatedContext);
