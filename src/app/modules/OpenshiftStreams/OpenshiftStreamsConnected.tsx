import React from 'react';
import { useHistory } from 'react-router-dom';
import { OpenshiftStreams } from './OpenshiftStreams';
import { FederatedContext, FederatedProps } from '@app/models';

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  const history = useHistory();

  const getConnectToRoutePath = (kafka, routePath) => {
    return history.createHref({ pathname: `/${routePath}` });
  };

  const onConnectToRoute = (kafka, routePath) => {
    history.push(`/${routePath}`);
  };

  return (
    <FederatedContext.Provider
      value={{ preCreateInstance: (open) => Promise.resolve(open), tokenEndPointUrl: 'fake-token-url' }}
    >
      <OpenshiftStreams
        onConnectToRoute={onConnectToRoute}
        getConnectToRoutePath={getConnectToRoutePath}
        preCreateInstance={(open) => Promise.resolve(open)}
        createDialogOpen={() => false}
        tokenEndPointUrl="fake-token-url"
      />
    </FederatedContext.Provider>
  );
};
