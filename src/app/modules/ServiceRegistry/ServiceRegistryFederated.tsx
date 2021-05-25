import React from 'react';
import { ServiceRegistry, ServiceRegistryProps } from '@app/modules/ServiceRegistry/ServiceRegistry';
import { AlertProvider, RootModal } from '@app/common';
import kasi18n from '@i18n/i18n';
import { I18nextProvider } from 'react-i18next';
// Version of ServiceRegistry for federation

const ServiceRegistryFederated = ({ getConnectToInstancePath }: ServiceRegistryProps) => {
  return (
    <I18nextProvider i18n={kasi18n}>
      <AlertProvider>
        <RootModal>
          <ServiceRegistry getConnectToInstancePath={getConnectToInstancePath} />
        </RootModal>
      </AlertProvider>
    </I18nextProvider>
  );
};

export default ServiceRegistryFederated;
