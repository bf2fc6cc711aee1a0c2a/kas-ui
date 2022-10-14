import { FunctionComponent } from "react";
import { PaginationProvider } from "@app/common";
import { FederatedContext, FederatedProps } from "@app/contexts";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";
import { KasLayout } from "@app/modules/OpenshiftStreams/components";
import { StreamsTableProps } from "@app/modules/OpenshiftStreams/components/StreamsTableConnected";
import { InstanceDrawer } from "@app/modules/InstanceDrawer";
import {
  InstanceDrawerContextProps,
  InstanceDrawerContextProvider,
} from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { StreamsTableConnectedWithAuth } from "@app/modules/OpenshiftStreams/StreamsTableConnectedWithAuth";
// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = StreamsTableProps &
  InstanceDrawerContextProps &
  FederatedProps;

const OpenshiftStreamsFederated: FunctionComponent<
  OpenshiftStreamsFederatedProps
> = ({
  preCreateInstance,
  shouldOpenCreateModal,
  getAllUserAccounts,
  ...drawerProps
}) => {
  return (
    <FederatedContext.Provider
      value={{
        preCreateInstance,
        shouldOpenCreateModal,
        getAllUserAccounts,
      }}
    >
      <ModalProvider>
        <PaginationProvider>
          <InstanceDrawerContextProvider {...drawerProps}>
            <InstanceDrawer
              data-ouia-app-id="dataPlane-streams"
              {...drawerProps}
            >
              <KasLayout data-ouia-app-id={"TODO"}>
                <StreamsTableConnectedWithAuth
                  preCreateInstance={preCreateInstance}
                />
              </KasLayout>
            </InstanceDrawer>
          </InstanceDrawerContextProvider>
        </PaginationProvider>
        <KasModalLoader />
      </ModalProvider>
    </FederatedContext.Provider>
  );
};

export default OpenshiftStreamsFederated;
