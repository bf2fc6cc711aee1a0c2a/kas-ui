import React from 'react';
import { ServiceRegistry } from '@app/ServiceRegistry/ServiceRegistry';
import { AlertProvider } from '@app/components/Alerts/Alerts';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_PATH__: string;

export const ServiceRegistryConnected = () => {
  return (
    <ApiContext.Provider value={
      {
        basePath: __BASE_PATH__
      }
    }>
      <AlertProvider>
        <ServiceRegistry />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
