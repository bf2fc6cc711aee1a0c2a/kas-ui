import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { ServiceAccounts, ServiceAccountsProps } from './ServiceAccounts';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { AlertContext, AlertContextProps } from '@app/common/MASAlerts/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';
import kasi18n from '../../../i18n/i18n';

// Federation version of ServiceAccounts

export type ServiceAccountsFederatedProps = ServiceAccountsProps & {
  getToken: () => Promise<string>;
  getUsername: () => Promise<string>;
  addAlert: (message: string, variant?: AlertVariant) => void;
  basePath: string;
};

const ServiceAccountsFederated = ({
  getUsername,
  getToken,
  addAlert,
  basePath,
  getConnectToInstancePath,
}: ServiceAccountsFederatedProps) => {
  const authContext = {
    getToken,
    getUsername,
  } as IAuthContext;

  const alertContext = {
    addAlert,
  } as AlertContextProps;

  return (
    <BrowserRouter>
      <I18nextProvider i18n={kasi18n}>
        <ApiContext.Provider
          value={{
            basePath: basePath,
          }}
        >
          <AlertContext.Provider value={alertContext}>
            <AuthContext.Provider value={authContext}>
              <ServiceAccounts getConnectToInstancePath={getConnectToInstancePath} />
            </AuthContext.Provider>
          </AlertContext.Provider>
        </ApiContext.Provider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default ServiceAccountsFederated;
