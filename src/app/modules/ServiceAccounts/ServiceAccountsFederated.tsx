import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { ServiceAccounts } from './ServiceAccounts';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';

// Federation version of ServiceAccounts

const ServiceAccountsFederated: React.FC = () => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <RootModal>
        <ServiceAccounts />
      </RootModal>
    </I18nextProvider>
  );
};

export default ServiceAccountsFederated;
