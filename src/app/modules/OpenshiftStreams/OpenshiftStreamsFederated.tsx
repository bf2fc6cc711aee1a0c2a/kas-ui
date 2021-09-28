import React from 'react';
import { I18nextProvider } from 'react-i18next';
import {
  OpenshiftStreams,
  OpenShiftStreamsProps,
} from '@app/modules/OpenshiftStreams/OpenshiftStreams';
import { PaginationProvider } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/contexts';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';

// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = OpenShiftStreamsProps & FederatedProps;

const OpenshiftStreamsFederated: React.FunctionComponent<OpenshiftStreamsFederatedProps> =
  ({ preCreateInstance, shouldOpenCreateModal, tokenEndPointUrl }) => {
    return (
      <I18nextProvider i18n={initI18N()}>
        <FederatedContext.Provider
          value={{ tokenEndPointUrl, preCreateInstance, shouldOpenCreateModal }}
        >
          <ModalProvider>
            <PaginationProvider>
              <OpenshiftStreams
                preCreateInstance={preCreateInstance}
                tokenEndPointUrl={tokenEndPointUrl}
              />
            </PaginationProvider>
            <KasModalLoader />
          </ModalProvider>
        </FederatedContext.Provider>
      </I18nextProvider>
    );
  };

export default OpenshiftStreamsFederated;
