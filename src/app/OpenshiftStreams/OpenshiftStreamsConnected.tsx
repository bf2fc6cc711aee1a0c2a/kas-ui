import React from 'react';
import { KafkaRequest } from '../../openapi';
import { OpenshiftStreams } from '@app/OpenshiftStreams/OpenshiftStreams';
import { AlertProvider } from '@app/components/Alerts/Alerts';

const onConnectInstance = async(event: KafkaRequest) => {
  if (event.id === undefined) {
    throw new Error();
  }
  console.log(event.id);
};

export const OpenshiftStreamsConnected =
  (<AlertProvider>
    <OpenshiftStreams onConnectToInstance={onConnectInstance} />
  </AlertProvider>);
