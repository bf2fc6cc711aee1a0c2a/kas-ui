import React, { useContext, useState } from 'react';
import { InstanceDrawerTab } from '@app/modules/InstanceDrawer/tabs';
import { KafkaInstance } from '@rhoas/app-services-ui-shared';

export type InstanceDrawerContextProps = {
  isInstanceDrawerOpen: boolean;
  instanceDrawerTab: InstanceDrawerTab;
  setInstanceDrawerTab: (tab: InstanceDrawerTab) => void;
  openInstanceDrawer: (tab?: InstanceDrawerTab) => void;
  closeInstanceDrawer: () => void;
  instanceDrawerInstance: KafkaInstance | undefined;
  setInstanceDrawerInstance: (instance: KafkaInstance) => void;
  setNoInstances: (noInstances: boolean) => void;
  noInstances: boolean;
};

export const InstanceDrawerContext = React.createContext<
  InstanceDrawerContextProps | undefined
>(undefined);

export const useInstanceDrawer = (): InstanceDrawerContextProps => {
  const answer = useContext(InstanceDrawerContext);
  if (answer === undefined) {
    throw new Error('must be used inside a InstanceDrawerContext provider');
  }
  return answer;
};

export type InstanceDrawerContextProviderProps = {
  initialTab?: InstanceDrawerTab;
  initialInstance?: KafkaInstance;
  initialNoInstances?: boolean;
};

export const InstanceDrawerContextProvider: React.FunctionComponent<InstanceDrawerContextProviderProps> =
  ({ initialTab, initialInstance, initialNoInstances = false, children }) => {
    const defaultTab = InstanceDrawerTab.DETAILS;
    const [instanceDrawerTab, setInstanceDrawerTab] = useState<
      InstanceDrawerTab | undefined
    >(initialTab);
    const [instanceDrawerInstance, setInstanceDrawerInstance] = useState<
      KafkaInstance | undefined
    >(initialInstance);
    const [noInstances, setNoInstances] = useState<boolean>(initialNoInstances);
    return (
      <InstanceDrawerContext.Provider
        value={{
          isInstanceDrawerOpen: instanceDrawerTab !== undefined,
          instanceDrawerTab:
            instanceDrawerTab === undefined ? defaultTab : instanceDrawerTab,
          setInstanceDrawerTab,
          instanceDrawerInstance,
          setInstanceDrawerInstance,
          setNoInstances,
          noInstances,
          openInstanceDrawer: (tab) => {
            if (tab) {
              setInstanceDrawerTab(tab);
            } else {
              setInstanceDrawerTab(defaultTab);
            }
          },
          closeInstanceDrawer: () => {
            setInstanceDrawerTab(undefined);
            setInstanceDrawerInstance(undefined);
          },
        }}
      >
        {children}
      </InstanceDrawerContext.Provider>
    );
  };
