import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/BackgroundColor/BackgroundColor.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  AlertContext,
  AuthContext,
  ConfigContext,
  QuotaContext,
} from '@rhoas/app-services-ui-shared';

import { initI18N } from '../src/i18n/i18n';
const i18n = initI18N();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <Router>
      <I18nextProvider i18n={i18n}>
        <ConfigContext.Provider
          value={
            {
              kas: {
                apiBasePath: '',
              },
              ams: { trialQuotaId: 'fake-quota-id' },
            }
          }
        >
          <AuthContext.Provider
            value={
              {
                kas: {
                  getToken: () => Promise.resolve('test-token'),
                },
                getUsername: () => Promise.resolve('api_kafka_service'),
              }
            }
          >
            <AlertContext.Provider
              value={{
                addAlert: () => {
                  // No-op
                },
              }}
            >
              <QuotaContext.Provider
                value={{
                  getQuota: () => {
                    return Promise.resolve({
                      loading: true,
                      data: undefined,
                      isServiceDown: false,
                    });
                  },
                }}
              >
                <React.Suspense fallback={null}>
                  <Story />
                </React.Suspense>
              </QuotaContext.Provider>
            </AlertContext.Provider>
          </AuthContext.Provider>
        </ConfigContext.Provider>
      </I18nextProvider>
    </Router>
  ),
];
