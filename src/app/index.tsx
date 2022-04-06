import { FunctionComponent, useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import {
  BasenameContext,
  Config,
  ConfigContext,
} from "@rhoas/app-services-ui-shared";
import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/patternfly/utilities/Sizing/sizing.css";
import "@patternfly/patternfly/utilities/Spacing/spacing.css";
import "@patternfly/patternfly/utilities/Display/display.css";
import "@patternfly/patternfly/utilities/Flex/flex.css";
import { AppLayout } from "@app/AppLayout/AppLayout";
import { AppRoutes } from "@app/routes";
import "@app/app.css";
import { getKeycloakInstance } from "./auth/keycloak/keycloakAuth";
import { MASLoading } from "@app/common";
import {
  KeycloakAuthProvider,
  KeycloakContext,
} from "@app/auth/keycloak/KeycloakContext";
import {
  MASErrorBoundary,
  PaginationProvider,
  AlertProvider,
} from "@app/common";
import { I18nProvider, ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";

let keycloak: Keycloak.KeycloakInstance | undefined;
declare const __BASE_PATH__: string;

const App: FunctionComponent = () => {
  const [initialized, setInitialized] = useState(false);

  // Initialize the client
  useEffect(() => {
    const init = async () => {
      keycloak = await getKeycloakInstance();
      setInitialized(true);
    };
    init();
  }, []);

  if (!initialized) return <MASLoading />;

  return (
    <BasenameContext.Provider value={{ getBasename: () => "" }}>
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
        <I18nProvider
          lng="en"
          resources={{
            en: {
              common: () =>
                import(
                  "@rhoas/app-services-ui-components/locales/en/common.json"
                ),
              "create-kafka-instance": () =>
                import(
                  "@rhoas/app-services-ui-components/locales/en/create-kafka-instance.json"
                ),
              kafka: () =>
                import(
                  "@rhoas/app-services-ui-components/locales/en/kafka.json"
                ),
              metrics: () =>
                import(
                  "@rhoas/app-services-ui-components/locales/en/metrics.json"
                ),
              kasTemporaryFixMe: () =>
                import("./kas-ui-dont-modify-temporay.json"),
            },
          }}
          debug={true}
        >
          {" "}
          <KeycloakContext.Provider
            value={{ keycloak, profile: keycloak?.profile }}
          >
            <KeycloakAuthProvider>
              <AlertProvider>
                <Router>
                  <Suspense fallback={<MASLoading />}>
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
                  </Suspense>
                </Router>
              </AlertProvider>
            </KeycloakAuthProvider>
          </KeycloakContext.Provider>
        </I18nProvider>
      </ConfigContext.Provider>
    </BasenameContext.Provider>
  );
};
export { App };
