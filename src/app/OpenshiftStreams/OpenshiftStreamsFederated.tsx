import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { KafkaRequest } from '../../openapi';
import { AlertVariant } from '@patternfly/react-core';
import { AlertContext, AlertContextProps } from '@app/components/Alerts/Alerts';
import { ApiContext } from '@app/api/ApiContext';
import { BrowserRouter } from 'react-router-dom';
import '../../i18n.js';

// Version of OpenshiftStreams for federation

export type OpenshiftStreamsFederatedProps = {
  getToken: () => Promise<string>;
  onConnectToInstance: (data: KafkaRequest) => void;
  addAlert: (message: string, variant?: AlertVariant) => void;
  basePath: string;
};

const OpenshiftStreamsFederated = ({ getToken, onConnectToInstance, addAlert, basePath }: OpenshiftStreamsFederatedProps) => {

  const authContext = {
    getToken
  } as IAuthContext;

  const alertContext = {
    addAlert
  } as AlertContextProps;

  return (
    // TODO don't add BrowserRouter here - see  https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend/issues/74
    <BrowserRouter>
      <ApiContext.Provider value={
        {
          basePath: basePath
        }
      }>
        <AlertContext.Provider value={alertContext}>
          <AuthContext.Provider value={authContext}>
            <OpenshiftStreams onConnectToInstance={onConnectToInstance}></OpenshiftStreams>
          </AuthContext.Provider>
        </AlertContext.Provider>
      </ApiContext.Provider>
    </BrowserRouter>
  )
    ;
};

export default OpenshiftStreamsFederated;
