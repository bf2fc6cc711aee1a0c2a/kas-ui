import React from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { ApiContext } from '@app/api/ApiContext';
import { AlertProvider } from '@app/components/Alerts/Alerts';

declare const __BASE_PATH__: string;

export const ServiceRegistryConnected = () => {
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <ServiceRegistry />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
