import React from 'react';
import { Metrics } from './Metrics';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { Config, ConfigContext } from '@bf2/ui-shared';

declare const __BASE_PATH__: string;

export const MetricsConnected = () => {
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
        <Metrics />
      </AlertProvider>
    </ConfigContext.Provider>
  );
};
