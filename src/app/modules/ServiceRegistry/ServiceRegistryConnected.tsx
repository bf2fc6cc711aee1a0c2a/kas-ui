import React from 'react';
import { ServiceRegistry } from './ServiceRegistry';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { Config, ConfigContext } from "@bf2/ui-shared";

declare const __BASE_PATH__: string;

export const ServiceRegistryConnected: React.FunctionComponent = () => {
  return (
    <ConfigContext.Provider value={{
      kas: {
        apiBasePath: __BASE_PATH__
      }
    } as Config}>
      <AlertProvider>
        <ServiceRegistry />
      </AlertProvider>
    </ConfigContext.Provider>
  );
};
