import React from "react";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";
import { InstanceDrawerContextProvider } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { KasLayout } from "@app/modules/OpenshiftStreams/components";
import { StreamsTableConnected } from "@app/modules/OpenshiftStreams/components/StreamsTableConnected";

export const OpenshiftStreamsStandalone: React.FunctionComponent = () => {
  return (
    <ModalProvider>
      <InstanceDrawerContextProvider>
        <KasLayout tokenEndPointUrl="fake-token-url">
          <StreamsTableConnected
            preCreateInstance={(open) => Promise.resolve(open)}
          />
        </KasLayout>
        <KasModalLoader />
      </InstanceDrawerContextProvider>
    </ModalProvider>
  );
};
