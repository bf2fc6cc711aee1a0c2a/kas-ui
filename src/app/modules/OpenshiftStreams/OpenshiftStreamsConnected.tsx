import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { RootModal } from '@app/common/RootModal';

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  return (
    <RootModal>
      <OpenshiftStreams
        preCreateInstance={(open) => Promise.resolve(open)}
        createDialogOpen={() => false}
        tokenEndPointUrl="fake-token-url"
      />
    </RootModal>
  );
};
