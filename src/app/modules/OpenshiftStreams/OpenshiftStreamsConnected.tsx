import React from 'react';
import { useHistory } from 'react-router';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AlertProvider } from '@app/common/MASAlerts/MASAlerts';
import { RootModal } from '@app/common/RootModal';
import { Config, ConfigContext } from '@bf2/ui-shared';

declare const __BASE_PATH__: string;

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  const history = useHistory();

  const getConnectToRoutePath = (kafka, routePath) => {
    return history.createHref({ pathname: `/${routePath}` });
  };

  const onConnectToRoute = (kafka, routePath) => {
    history.push(`/${routePath}`);
  };

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
            onConnectToRoute={onConnectToRoute}
            getConnectToRoutePath={getConnectToRoutePath}
            preCreateInstance={(open) => Promise.resolve(open)}
            createDialogOpen={() => false}
            tokenEndPointUrl="fake-token-url"
          />
        </RootModal>
      </AlertProvider>
    </ConfigContext.Provider>
  );
};
