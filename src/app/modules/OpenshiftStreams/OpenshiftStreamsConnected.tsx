import React from 'react';
import { useHistory } from 'react-router';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';

declare const __BASE_PATH__: string;

export const OpenshiftStreamsConnected = () => {
  const history = useHistory();

  const getConnectToServiceAcountsPath = () => {
    return history.createHref({ pathname: '/service-accounts' });
  };

  const onConnectToServiceAccounts = () => {
    history.push('/service-accounts');
  };

  return (
    <ApiContext.Provider
      value={{
        basePath: __BASE_PATH__,
      }}
    >
      <AlertProvider>
        <OpenshiftStreams
          onConnectToInstance={() => {}}
          getConnectToInstancePath={() => ''}
          preCreateInstance={(open) => Promise.resolve(open)}
          createDialogOpen={() => false}
          getConnectToServiceAcountsPath={getConnectToServiceAcountsPath}
          onConnectToServiceAccounts={onConnectToServiceAccounts}
        />
      </AlertProvider>
    </ApiContext.Provider>
  );
};
