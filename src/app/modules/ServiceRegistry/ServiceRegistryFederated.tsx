import React from 'react';
import { ServiceRegistry } from '@app/modules/ServiceRegistry/ServiceRegistry';
import { RootModal } from '@app/common';
import { I18nextProvider } from 'react-i18next';
import { initI18N } from '@i18n/i18n';
// Version of ServiceRegistry for federation

const ServiceRegistryFederated: React.FunctionComponent = () => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <RootModal>
        <ServiceRegistry />
      </RootModal>
    </I18nextProvider>
  );
};

export default ServiceRegistryFederated;
