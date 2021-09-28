import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { ServiceAccounts } from './ServiceAccounts';
import { initI18N } from '@i18n/i18n';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';

// Federation version of ServiceAccounts

const ServiceAccountsFederated: React.FC = () => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <ModalProvider>
        <ServiceAccounts />
        <KasModalLoader />
      </ModalProvider>
    </I18nextProvider>
  );
};

export default ServiceAccountsFederated;
