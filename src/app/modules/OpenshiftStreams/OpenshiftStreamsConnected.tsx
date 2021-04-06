import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AlertProvider, GlobalModal } from '@app/common';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_PATH__: string;

export const OpenshiftStreamsConnected = () => {
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <GlobalModal>
          <OpenshiftStreams
            onConnectToInstance={() => {}}
            getConnectToInstancePath={() => ''}
            preCreateInstance={(open) => Promise.resolve(open)}
            createDialogOpen={() => false}
          />
        </GlobalModal>
      </AlertProvider>
    </ApiContext.Provider>
  );
};
