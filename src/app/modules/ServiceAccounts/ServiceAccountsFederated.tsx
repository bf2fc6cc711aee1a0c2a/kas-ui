import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AlertVariant } from '@patternfly/react-core';
import { ServiceAccounts, ServiceAccountsProps } from './ServiceAccounts';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { AlertContext, AlertContextProps } from '@app/common/MASAlerts/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';
import '../../../i18n/i18n';

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
    </BrowserRouter>
  );
};

export default ServiceAccountsFederated;
