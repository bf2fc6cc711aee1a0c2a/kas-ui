import { FunctionComponent } from "react";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";
import { KasLayout } from "@app/modules/OpenshiftStreams/components";
import { StreamsTableConnected } from "@app/modules/OpenshiftStreams/components/StreamsTableConnected";

export const OpenshiftStreamsStandalone: FunctionComponent = () => {
  return (
    <ModalProvider>
      <KasLayout data-ouia-app-id={"dummy"}>
        <StreamsTableConnected
          preCreateInstance={(open) => Promise.resolve(open)}
        />
      </KasLayout>
      <KasModalLoader />
    </ModalProvider>
  );
};
