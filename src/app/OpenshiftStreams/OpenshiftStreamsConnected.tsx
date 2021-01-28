import React from 'react';
import { KafkaRequest } from '../../openapi';
import { OpenshiftStreams } from '@app/OpenshiftStreams/OpenshiftStreams';
import { AlertProvider } from '@app/components/Alerts/Alerts';
import { ApiContext } from '@app/api/ApiContext';
import { StoreProvider, useStore, rootReducer } from '@app/context-state-reducer';

declare const __BASE_PATH__: string;

const onConnectInstance = async (event: KafkaRequest) => {
  if (event.id === undefined) {
    throw new Error();
  }
  console.log(event.id);
};

export const OpenshiftStreamsConnected = () => {
  const [store] = useStore(rootReducer);
  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <StoreProvider value={store}>
          <OpenshiftStreams onConnectToInstance={onConnectInstance} />
        </StoreProvider>
      </AlertProvider>
    </ApiContext.Provider>
  );
};
