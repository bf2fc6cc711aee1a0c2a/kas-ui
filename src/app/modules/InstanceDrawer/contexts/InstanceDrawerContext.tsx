import { createContext, FunctionComponent, useContext } from "react";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { KafkaInstanceEnhanced } from "@app/modules/OpenshiftStreams/components/StreamsTableConnected/useKafkaInstances";

export type InstanceDrawerContextProps = {
  isDrawerOpen: boolean;
  drawerInstance: KafkaInstanceEnhanced | undefined;
  setDrawerInstance: (instance: KafkaInstanceEnhanced) => void;
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
