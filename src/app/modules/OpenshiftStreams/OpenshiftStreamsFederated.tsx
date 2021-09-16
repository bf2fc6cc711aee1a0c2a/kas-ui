import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { OpenshiftStreams, OpenShiftStreamsProps } from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { RootModal, PaginationProvider } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/contexts';

// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = OpenShiftStreamsProps & FederatedProps;

const OpenshiftStreamsFederated: React.FunctionComponent<OpenshiftStreamsFederatedProps> = ({
  preCreateInstance,
  shouldOpenCreateModal,
  tokenEndPointUrl,
  getQuota,
}) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <FederatedContext.Provider value={{ getQuota, tokenEndPointUrl, preCreateInstance, shouldOpenCreateModal }}>
        <RootModal>
          <PaginationProvider>
            <OpenshiftStreams preCreateInstance={preCreateInstance} tokenEndPointUrl={tokenEndPointUrl} />
          </PaginationProvider>
        </RootModal>
      </FederatedContext.Provider>
    </I18nextProvider>
  );
};

export default OpenshiftStreamsFederated;
