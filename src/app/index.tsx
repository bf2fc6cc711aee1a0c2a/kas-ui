import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  BasenameContext,
  Config,
  ConfigContext,
} from '@rhoas/app-services-ui-shared';
import '@patternfly/patternfly/patternfly.css';
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
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from '@app/auth/keycloak/KeycloakContext';
import { initI18N } from '@i18n/i18n';
import {
  MASErrorBoundary,
  PaginationProvider,
  AlertProvider,
} from '@app/common';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';

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
    <BasenameContext.Provider value={{ getBasename: () => '' }}>
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
          <KeycloakContext.Provider
            value={{ keycloak, profile: keycloak?.profile }}
          >
            <KeycloakAuthProvider>
              <AlertProvider>
                <Router>
                  <React.Suspense fallback={<MASLoading />}>
                    <MASErrorBoundary>
                      <PaginationProvider>
                        <ModalProvider>
                          <AppLayout>
                            <AppRoutes />
                          </AppLayout>
                          <KasModalLoader />
                        </ModalProvider>
                      </PaginationProvider>
                    </MASErrorBoundary>
                  </React.Suspense>
                </Router>
              </AlertProvider>
            </KeycloakAuthProvider>
          </KeycloakContext.Provider>
        </I18nextProvider>
      </ConfigContext.Provider>
    </BasenameContext.Provider>
  );
};
export { App };
