import { FunctionComponent } from "react";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";
import { KasLayout } from "@app/modules/OpenshiftStreams/components";
import { StreamsTableConnectedWithAuth } from "@app/modules/OpenshiftStreams/StreamsTableConnectedWithAuth";

export const OpenshiftStreamsStandalone: FunctionComponent = () => {
  return (
    <ModalProvider>
      <KasLayout data-ouia-app-id={"dummy"}>
        <StreamsTableConnectedWithAuth
          preCreateInstance={(open) => Promise.resolve(open)}
        />
      </KasLayout>
      <KasModalLoader />
    </ModalProvider>
  );
};
