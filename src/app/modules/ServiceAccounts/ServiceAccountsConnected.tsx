import React from 'react';
import { ServiceAccounts } from './ServiceAccounts';
import { ApiContext } from '@app/api/ApiContext';
import { AlertProvider, GlobalModal } from '@app/common';

declare const __BASE_PATH__: string;

export const ServiceAccountsConnected = () => {
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <GlobalModal>
          <ServiceAccounts />
        </GlobalModal>
      </AlertProvider>
    </ApiContext.Provider>
  );
};
