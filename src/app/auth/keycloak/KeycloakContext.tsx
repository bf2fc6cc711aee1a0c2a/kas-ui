import { FunctionComponent, createContext } from "react";
import { KeycloakInstance, KeycloakProfile } from "keycloak-js";
import {
  getKeyCloakToken,
  getParsedKeyCloakToken,
} from "@app/auth/keycloak/keycloakAuth";
import { Auth, AuthContext } from "@rhoas/app-services-ui-shared";

// This is a context which can manage the keycloak
export interface IKeycloakContext {
  keycloak?: KeycloakInstance | undefined;
  profile?: KeycloakProfile | undefined;
}

export const KeycloakContext = createContext<IKeycloakContext>({
  keycloak: undefined,
});

export const KeycloakAuthProvider: FunctionComponent = (props) => {
  const getUsername = () => {
    return getParsedKeyCloakToken().then(
      (token) => (token as Record<string, string>)["username"]
    );
  };

  const isOrgAdmin = () => {
    return getParsedKeyCloakToken().then(
      (token) => (token as Record<string, boolean>)["is_org_admin"]
    );
  };

  const authTokenContext = {
    kas: {
      getToken: getKeyCloakToken,
    },
    getUsername,
    isOrgAdmin,
  } as Auth;
  return (
    <AuthContext.Provider value={authTokenContext}>
      {props.children}
    </AuthContext.Provider>
  );
};
