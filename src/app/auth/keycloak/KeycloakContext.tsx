import React, { useContext, useState } from 'react';
import { KeycloakInstance, KeycloakProfile } from 'keycloak-js';
import { getAuthHeader, getKeyCloakToken } from '@app/auth/keycloak/keycloakAuth';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';

// This is a context which can manage the keycloak
export interface IKeycloakContext {
    keycloak?: KeycloakInstance | undefined
    profile?: KeycloakProfile | undefined
}

export const KeycloakContext = React.createContext<IKeycloakContext>({ keycloak: undefined });

export const KeycloakAuthProvider = (props) => {

  const [token, setToken] = useState<string | undefined>(undefined);

  const fetch = async () => {
    const token = await getKeyCloakToken();
    setToken(token);
    return;
  }

  React.useEffect(() => {
    fetch();
  }, []);

  const authTokenContext = {
    token: token
  } as IAuthContext;
  return (
    <AuthContext.Provider value={authTokenContext}>
      { props.children }
    </AuthContext.Provider>
  );
};
