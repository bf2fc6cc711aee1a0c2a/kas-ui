import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  return (
    <OpenshiftStreams
      preCreateInstance={(open) => Promise.resolve(open)}
      createDialogOpen={() => false}
      tokenEndPointUrl="fake-token-url"
    />
  );
};
