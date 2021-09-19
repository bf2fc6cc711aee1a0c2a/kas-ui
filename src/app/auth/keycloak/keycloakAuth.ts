import Keycloak, { KeycloakInstance, KeycloakTokenParsed } from 'keycloak-js';

export let keycloak: KeycloakInstance | undefined;

/**
 * Get keycloak instance
 *
 * @return an initiated keycloak instance or `undefined`
 * if keycloak isn't configured
 *
 */
export const getKeycloakInstance = async (): Promise<
  KeycloakInstance | undefined
> => {
  if (!keycloak) await init();
  return keycloak;
};

/**
 * Initiate keycloak instance.
 *
 * Set keycloak to undefined if
 * keycloak isn't configured
 *
 */
export const init = async (): Promise<void> => {
  try {
    keycloak = Keycloak();
    if (keycloak) {
      await keycloak.init({
        onLoad: 'login-required',
      });
    }
  } catch {
    keycloak = undefined;
    console.warn(
      'Auth: Unable to initialize keycloak. Client side will not be configured to use authentication'
    );
  }
};

/**
 * Use keycloak update token function to retrieve
 * keycloak token
 *
 * @return keycloak token or empty string if keycloak
 * isn't configured
 *
 */
export const getKeyCloakToken = async (): Promise<string> => {
  await keycloak?.updateToken(50);
  if (keycloak?.token) return keycloak.token;
  console.error('No keycloak token available');
  return 'foo';
};

/**
 * Use keycloak update token function to retrieve
 * keycloak token
 *
 * @return keycloak token or empty string if keycloak
 * isn't configured
 *
 */
export const getParsedKeyCloakToken =
  async (): Promise<KeycloakTokenParsed> => {
    await keycloak?.updateToken(50);
    if (keycloak?.tokenParsed) return keycloak.tokenParsed;
    console.error('No keycloak token available');
    return {} as KeycloakTokenParsed;
  };

/**
 * logout of keycloak, clear cache and offline store then redirect to
 * keycloak login page
 *
 * @param keycloak the keycloak instance
 * @param client offix client
 *
 */
export const logout = async (
  keycloak: Keycloak.KeycloakInstance | undefined
): Promise<void> => {
  if (keycloak) {
    await keycloak.logout();
  }
};
