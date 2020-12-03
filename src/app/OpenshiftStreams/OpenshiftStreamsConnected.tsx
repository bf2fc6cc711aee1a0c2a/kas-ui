import React from 'react';
import { KafkaRequest } from '../../openapi';
import { OpenshiftStreams } from '@app/OpenshiftStreams/OpenshiftStreams';
import { AlertProvider } from '@app/components/Alerts/Alerts';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_URL__: string;

const onConnectInstance = async (event: KafkaRequest) => {
  if (event.id === undefined) {
    throw new Error();
  }
  console.log(event.id);
};

export const OpenshiftStreamsConnected = () => {
  return (
    <ApiContext.Provider value={
      {
        basePath: __BASE_URL__
      }
    }>
      <AlertProvider>
        <OpenshiftStreams onConnectToInstance={onConnectInstance} />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
