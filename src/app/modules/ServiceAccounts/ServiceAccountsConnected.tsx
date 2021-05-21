import React from 'react';
import { ServiceAccounts } from './ServiceAccounts';
import { AlertProvider, RootModal } from '@app/common';
import { Config, ConfigContext } from "@bf2/ui-shared";

declare const __BASE_PATH__: string;

export const ServiceAccountsConnected = () => {
  return (
    <ConfigContext.Provider value={{
      kas: {
        apiBasePath: __BASE_PATH__
      }
    } as Config}>
      <AlertProvider>
        <RootModal>
          <ServiceAccounts />
        </RootModal>
      </AlertProvider>
    </ConfigContext.Provider>
  );
};
