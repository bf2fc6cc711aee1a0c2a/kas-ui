import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { RootModal } from '@app/common/RootModal';
import { Config, ConfigContext } from '@bf2/ui-shared';

declare const __BASE_PATH__: string;

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  return (
    <ConfigContext.Provider
      value={
        {
          kas: {
            apiBasePath: __BASE_PATH__,
          },
        } as Config
      }
    >
      <AlertProvider>
        <RootModal>
          <OpenshiftStreams
            preCreateInstance={(open) => Promise.resolve(open)}
            createDialogOpen={() => false}
            tokenEndPointUrl="fake-token-url"
          />
        </RootModal>
      </AlertProvider>
    </ConfigContext.Provider>
  );
};
