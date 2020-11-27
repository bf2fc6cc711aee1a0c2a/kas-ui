import React from 'react';
import { KafkaRequest } from '../../openapi';
import { OpenshiftStreams } from '@app/OpenshiftStreams/OpenshiftStreams';

const onConnectInstance = async(event: KafkaRequest) => {
  if (event.id === undefined) {
    throw new Error();
  }
  console.log(event.id);
};

export const OpenshiftStreamsConnected = <OpenshiftStreams onConnectToInstance={onConnectInstance} />;
