import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';
import { FederatedContext, FederatedProps } from '@app/contexts';
import {
  KasTableView,
  KasTableProps,
} from '@app/modules/KasTableView/KasTableView';

// Version of KasTableView for federation
type KasTableFederatedProps = KasTableProps & FederatedProps;

const KasTableFederated: React.FunctionComponent<KasTableFederatedProps> = ({
  preCreateInstance,
  shouldOpenCreateModal,
  tokenEndPointUrl,
}) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <FederatedContext.Provider
        value={{ tokenEndPointUrl, preCreateInstance, shouldOpenCreateModal }}
      >
        <RootModal>
          <KasTableView tokenEndPointUrl={tokenEndPointUrl} />
        </RootModal>
      </FederatedContext.Provider>
    </I18nextProvider>
  );
};

export default KasTableFederated;
