import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { KafkaRequest } from '../../openapi';
import { useHistory } from 'react-router';

// Version of OpenshiftStreams for federation

export type OpenshiftStreamsFederatedProps = {
  token: string;
  onConnectToInstance: (data: KafkaRequest) => void;
};

const OpenshiftStreamsFederated = ({ token, onConnectToInstance }: OpenshiftStreamsFederatedProps) => {

  const authContext = {
    token
  } as IAuthContext;


  return (
    <AuthContext.Provider value={authContext}>
      <OpenshiftStreams onConnectToInstance={onConnectToInstance}></OpenshiftStreams>
    </AuthContext.Provider>
  )
};

export { OpenshiftStreamsFederated };
