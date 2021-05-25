import React from 'react';
import { OpenshiftStreams, OpenShiftStreamsProps } from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { RootModal, AlertProvider } from '@app/common';
import { BrowserRouter } from 'react-router-dom';
import kasi18n from '@i18n/i18n';
import { I18nextProvider } from 'react-i18next';

// Version of OpenshiftStreams for federation

const OpenshiftStreamsFederated = ({
  onConnectToRoute,
  getConnectToRoutePath,
  preCreateInstance,
  createDialogOpen,
  tokenEndPointUrl,
}: OpenShiftStreamsProps) => {
  return (
    // TODO don't add BrowserRouter here - see  https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend/issues/74
    <BrowserRouter>
      <I18nextProvider i18n={kasi18n}>
        <AlertProvider>
          <RootModal>
            <OpenshiftStreams
              onConnectToRoute={onConnectToRoute}
              getConnectToRoutePath={getConnectToRoutePath}
              preCreateInstance={preCreateInstance}
              createDialogOpen={createDialogOpen}
              tokenEndPointUrl={tokenEndPointUrl}
            />
          </RootModal>
        </AlertProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default OpenshiftStreamsFederated;
