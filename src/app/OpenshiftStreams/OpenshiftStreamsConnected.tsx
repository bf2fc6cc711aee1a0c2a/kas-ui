import React from 'react';
import { KafkaRequest } from '../../openapi';
import { OpenshiftStreams } from '@app/OpenshiftStreams/OpenshiftStreams';
import { AlertProvider } from '@app/components/Alerts/Alerts';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_PATH__: string;

export const OpenshiftStreamsConnected = () => {
  return (
    <ApiContext.Provider value={
      {
        basePath: __BASE_PATH__
      }
    }>
      <AlertProvider>
        <OpenshiftStreams onConnectToInstance={() => {}} getConnectToInstancePath={() => ""} />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
