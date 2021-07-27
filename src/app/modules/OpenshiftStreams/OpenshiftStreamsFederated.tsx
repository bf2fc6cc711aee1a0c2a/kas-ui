import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { OpenshiftStreams, OpenShiftStreamsProps } from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/models';

// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = OpenShiftStreamsProps & FederatedProps;

const OpenshiftStreamsFederated: React.FunctionComponent<OpenshiftStreamsFederatedProps> = ({
  onConnectToRoute,
  getConnectToRoutePath,
  preCreateInstance,
  createDialogOpen,
  tokenEndPointUrl,
}) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <FederatedContext.Provider value={{ preCreateInstance, tokenEndPointUrl }}>
        <RootModal>
          <OpenshiftStreams
            onConnectToRoute={onConnectToRoute}
            getConnectToRoutePath={getConnectToRoutePath}
            preCreateInstance={preCreateInstance}
            createDialogOpen={createDialogOpen}
            tokenEndPointUrl={tokenEndPointUrl}
          />
        </RootModal>
      </FederatedContext.Provider>
    </I18nextProvider>
  );
};

export default OpenshiftStreamsFederated;
