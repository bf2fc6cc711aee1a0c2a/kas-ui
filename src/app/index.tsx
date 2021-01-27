import * as React from 'react';
import "@patternfly/patternfly/base/patternfly-shield-inheritable.css";
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";
import "@cloudmosaic/quickstarts/dist/quickstarts.css";
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { Loading } from './components/Loading/Loading';
import { KeycloakAuthProvider, KeycloakContext } from '@app/auth/keycloak/KeycloakContext';
import '../i18n/i18n';
import { ErrorBoundary } from '@app/components/ErrorBoundary';

let keycloak: Keycloak.KeycloakInstance | undefined;

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

  if (!initialized) return <Loading />;

  // TODO - index doing router is not desired.
  // Split to App.tsx etc.
  return (
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <Router>
          <React.Suspense fallback={<Loading />}>
            <ErrorBoundary>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </ErrorBoundary>
          </React.Suspense>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
  );
};
export { App };
