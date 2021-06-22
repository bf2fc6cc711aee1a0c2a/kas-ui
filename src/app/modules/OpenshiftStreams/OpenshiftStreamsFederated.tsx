import React from 'react';
import { OpenshiftStreams, OpenShiftStreamsProps } from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { RootModal, AlertProvider } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { I18nextProvider } from 'react-i18next';

// Version of OpenshiftStreams for federation

const OpenshiftStreamsFederated: React.FunctionComponent<OpenShiftStreamsProps> = ({
  preCreateInstance,
  createDialogOpen,
  tokenEndPointUrl,
}) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <AlertProvider>
        <RootModal>
          <OpenshiftStreams
            preCreateInstance={preCreateInstance}
            createDialogOpen={createDialogOpen}
            tokenEndPointUrl={tokenEndPointUrl}
          />
        </RootModal>
      </AlertProvider>
    </I18nextProvider>
  );
};

export default OpenshiftStreamsFederated;
