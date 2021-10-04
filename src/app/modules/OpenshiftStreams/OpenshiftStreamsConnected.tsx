import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  return (
    <ModalProvider>
      <OpenshiftStreams
        preCreateInstance={(open) => Promise.resolve(open)}
        tokenEndPointUrl='fake-token-url'
      />
      <KasModalLoader />
    </ModalProvider>
  );
};
