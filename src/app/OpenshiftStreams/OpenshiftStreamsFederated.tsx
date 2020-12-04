import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { KafkaRequest } from '../../openapi';
import { AlertVariant } from '@patternfly/react-core';
import { AlertContext, AlertContextProps } from '@app/components/Alerts/Alerts';

// Version of OpenshiftStreams for federation

export type OpenshiftStreamsFederatedProps = {
  getToken: () => Promise<string>;
  onConnectToInstance: (data: KafkaRequest) => void;
  addAlert: (message: string, variant?: AlertVariant) => void;
};


const OpenshiftStreamsFederated = ({ getToken, onConnectToInstance, addAlert }: OpenshiftStreamsFederatedProps) => {

  const authContext = {
    getToken
  } as IAuthContext;

  const alertContext = {
    addAlert
  } as AlertContextProps;

  return (
    <AlertContext.Provider value={alertContext}>
      <AuthContext.Provider value={authContext}>
        <OpenshiftStreams onConnectToInstance={onConnectToInstance}></OpenshiftStreams>
      </AuthContext.Provider>
    </AlertContext.Provider>
  )
};

export default OpenshiftStreamsFederated;
