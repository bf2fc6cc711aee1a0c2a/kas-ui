import { createContext, useContext } from "react";
import { Principal } from "@rhoas/app-services-ui-shared";

export type FederatedProps = {
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
  getAllUserAccounts?: () => Principal[];
};

export const FederatedContext = createContext<FederatedProps | undefined>(
  undefined
);
export const useFederated = (): FederatedProps | undefined =>
  useContext(FederatedContext);
