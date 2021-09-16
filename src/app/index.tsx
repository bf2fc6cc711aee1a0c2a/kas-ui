import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import { Config, ConfigContext } from '@bf2/ui-shared';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { MASLoading } from '@app/common';
import { KeycloakAuthProvider, KeycloakContext } from '@app/auth/keycloak/KeycloakContext';
import { initI18N } from '@i18n/i18n';
import { MASErrorBoundary, RootModal, PaginationProvider, AlertProvider } from '@app/common';

let keycloak: Keycloak.KeycloakInstance | undefined;
declare const __BASE_PATH__: string;

const App: React.FunctionComponent = () => {
  const [initialized, setInitialized] = React.useState(false);

  // Initialize the client
  React.useEffect(() => {
    const init = async () => {
      keycloak = await getKeycloakInstance();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized) return <MASLoading />;

  return (
    <ConfigContext.Provider
      value={
        {
          kas: {
            apiBasePath: __BASE_PATH__,
          },
          ams: {
            apiBasePath: __BASE_PATH__,
          },
        } as Config
      }
    >
      <I18nextProvider i18n={initI18N()}>
        <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
          <KeycloakAuthProvider>
            <AlertProvider>
              <Router>
                <React.Suspense fallback={<MASLoading />}>
                  <MASErrorBoundary>
                    <PaginationProvider>
                      <RootModal>
                        <AppLayout>
                          <AppRoutes />
                        </AppLayout>
                      </RootModal>
                    </PaginationProvider>
                  </MASErrorBoundary>
                </React.Suspense>
              </Router>
            </AlertProvider>
          </KeycloakAuthProvider>
        </KeycloakContext.Provider>
      </I18nextProvider>
    </ConfigContext.Provider>
  );
};
export { App };
