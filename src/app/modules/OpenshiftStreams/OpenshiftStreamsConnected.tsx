import React from 'react';
import { useHistory } from 'react-router-dom';
import { OpenshiftStreams } from './OpenshiftStreams';

export const OpenshiftStreamsConnected: React.FunctionComponent = () => {
  const history = useHistory();

  const getConnectToRoutePath = (kafka, routePath) => {
    return history.createHref({ pathname: `/${routePath}` });
  };

  const onConnectToRoute = (kafka, routePath) => {
    history.push(`/${routePath}`);
  };

  return (
    <OpenshiftStreams
      onConnectToRoute={onConnectToRoute}
      getConnectToRoutePath={getConnectToRoutePath}
      preCreateInstance={(open) => Promise.resolve(open)}
      tokenEndPointUrl="fake-token-url"
    />
  );
};
