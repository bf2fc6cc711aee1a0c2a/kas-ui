import React from 'react';
import { ServiceAccounts } from './ServiceAccounts';
import { ApiContext } from '@app/api/ApiContext';
import { AlertProvider, RootModal } from '@app/common';

declare const __BASE_PATH__: string;

export const ServiceAccountsConnected = () => {
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <RootModal>
          <ServiceAccounts />
        </RootModal>
      </AlertProvider>
    </ApiContext.Provider>
  );
};
