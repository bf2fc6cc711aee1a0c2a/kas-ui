import React from 'react';
import { OpenshiftStreams } from './OpenshiftStreams';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';

// Version of OpenshiftStreams for federation

export type OpenshiftStreamsFederatedProps = {
  token: string;
};

const OpenshiftStreamsFederated = ({ token }: OpenshiftStreamsFederatedProps) => {
  const authContext = {
    token
  } as IAuthContext;

  return (
    <AuthContext.Provider value={authContext}>
      <OpenshiftStreams></OpenshiftStreams>
    </AuthContext.Provider>
  )
};

export default OpenshiftStreamsFederated;
