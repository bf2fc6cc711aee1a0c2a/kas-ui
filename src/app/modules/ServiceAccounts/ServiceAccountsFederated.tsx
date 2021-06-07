import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ServiceAccounts } from './ServiceAccounts';
import { RootModal, AlertProvider } from '@app/common';
import kasi18n, { initI18N } from '@i18n/i18n';

// Federation version of ServiceAccounts

const ServiceAccountsFederated: React.FC = () => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={initI18N()}>
        <AlertProvider>
          <RootModal>
            <ServiceAccounts />
          </RootModal>
        </AlertProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default ServiceAccountsFederated;
