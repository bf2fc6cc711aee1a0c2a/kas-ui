import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { OpenshiftStreams, OpenShiftStreamsProps } from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/contexts';

// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = OpenShiftStreamsProps & FederatedProps;

const OpenshiftStreamsFederated: React.FunctionComponent<OpenshiftStreamsFederatedProps> = ({
  preCreateInstance,
  createDialogOpen,
  tokenEndPointUrl,
  getAMSQuotaCost,
}) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <FederatedContext.Provider value={{ getAMSQuotaCost, tokenEndPointUrl, preCreateInstance }}>
        <RootModal>
          <OpenshiftStreams
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
