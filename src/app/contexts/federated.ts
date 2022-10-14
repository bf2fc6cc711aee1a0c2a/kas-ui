import { createContext, useContext } from "react";
import { Principal } from "@rhoas/app-services-ui-shared";

export type FederatedProps = {
  preCreateInstance?: (isOpen: boolean) => Promise<boolean>;
  shouldOpenCreateModal: () => Promise<boolean>;
  getAllUserAccounts?: () => Principal[];
};

export const FederatedContext = createContext<FederatedProps>(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  null!
);
export const useFederated = (): FederatedProps => useContext(FederatedContext);
