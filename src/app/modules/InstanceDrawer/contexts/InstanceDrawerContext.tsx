import { FunctionComponent, createContext, useContext } from "react";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";
import { SupportedKafkaSize } from "@rhoas/kafka-management-sdk/dist/generated/model/supported-kafka-size";

export type InstanceDrawerContextProps = {
  isDrawerOpen: boolean;
  drawerInstance:
    | Required<KafkaRequest & { size: Required<SupportedKafkaSize> }>
    | undefined;
  setDrawerInstance: (id: string) => void;
  drawerActiveTab: InstanceDrawerTab | undefined;
  setDrawerActiveTab: (tab: InstanceDrawerTab) => void;
  openDrawer: (tab?: InstanceDrawerTab) => void;
  closeDrawer: () => void;
  tokenEndPointUrl: string;
};

export const InstanceDrawerContext = createContext<
  InstanceDrawerContextProps | undefined
>(undefined);

export const useInstanceDrawer = (): InstanceDrawerContextProps => {
  const answer = useContext(InstanceDrawerContext);
  if (answer === undefined) {
    throw new Error("must be used inside a InstanceDrawerContext provider");
  }
  return answer;
};

export const InstanceDrawerContextProvider: FunctionComponent<
  InstanceDrawerContextProps
> = ({ children, ...props }) => {
  return (
    <InstanceDrawerContext.Provider value={props}>
      {children}
    </InstanceDrawerContext.Provider>
  );
};
