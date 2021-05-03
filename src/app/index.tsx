import * as React from 'react';
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/patternfly/utilities/Sizing/sizing.css";
import "@patternfly/patternfly/utilities/Spacing/spacing.css";
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { getKeycloakInstance } from './auth/keycloak/keycloakAuth';
import { MASLoading } from '@app/common';
import { KeycloakAuthProvider, KeycloakContext } from '@app/auth/keycloak/KeycloakContext';
import kasi18n from '../i18n/i18n';
import {I18nextProvider} from 'react-i18next';
import { MASErrorBoundary } from '@app/common';

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

  if (!initialized) return <MASLoading />;

  // TODO - index doing router is not desired.
  // Split to App.tsx etc.
  return (
    <I18nextProvider i18n={kasi18n}>
    <KeycloakContext.Provider value={{ keycloak, profile: keycloak?.profile }}>
      <KeycloakAuthProvider>
        <Router>
          <React.Suspense fallback={<MASLoading />}>
            <MASErrorBoundary>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </MASErrorBoundary>
          </React.Suspense>
        </Router>
      </KeycloakAuthProvider>
    </KeycloakContext.Provider>
    </I18nextProvider>
  );
};
export { App };
