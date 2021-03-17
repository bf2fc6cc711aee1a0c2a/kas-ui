import React from 'react';
import { ServiceAccounts } from './ServiceAccounts';
import { ApiContext } from '@app/api/ApiContext';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';

declare const __BASE_PATH__: string;

export const ServiceAccountsConnected = () => {
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <ServiceAccounts />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
