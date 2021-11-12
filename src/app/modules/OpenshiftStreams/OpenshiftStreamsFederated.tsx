import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { PaginationProvider } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/contexts';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';
import { InstanceDrawerContextProvider } from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';
import { KasLayout } from '@app/modules/OpenshiftStreams/components';
import {
  StreamsTableConnected,
  StreamsTableProps,
} from '@app/modules/OpenshiftStreams/components/StreamsTableConnected';

// Version of OpenshiftStreams for federation
type OpenshiftStreamsFederatedProps = StreamsTableProps & FederatedProps;

const OpenshiftStreamsFederated: React.FunctionComponent<OpenshiftStreamsFederatedProps> =
  ({
    preCreateInstance,
    shouldOpenCreateModal,
    tokenEndPointUrl,
    setKafkaInstance,
    getAllUserAccounts,
  }) => {
    return (
      <I18nextProvider i18n={initI18N()}>
        <FederatedContext.Provider
          value={{
            tokenEndPointUrl,
            preCreateInstance,
            shouldOpenCreateModal,
            setKafkaInstance,
            getAllUserAccounts,
          }}
        >
          <ModalProvider>
            <InstanceDrawerContextProvider>
              <PaginationProvider>
                <KasLayout tokenEndPointUrl={tokenEndPointUrl}>
                  <StreamsTableConnected
                    preCreateInstance={preCreateInstance}
                  />
                </KasLayout>
              </PaginationProvider>
              <KasModalLoader />
            </InstanceDrawerContextProvider>
          </ModalProvider>
        </FederatedContext.Provider>
      </I18nextProvider>
    );
  };

export default OpenshiftStreamsFederated;
