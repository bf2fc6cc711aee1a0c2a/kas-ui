import React from 'react';
import { Metrics } from './Metrics';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_PATH__: string;

export const MetricsConnected = () => {
  return (
    <ApiContext.Provider value={
      {
        basePath: __BASE_PATH__
      }
    }>
      <AlertProvider>
        <Metrics/>
      </AlertProvider>
    </ApiContext.Provider>
  );
};
