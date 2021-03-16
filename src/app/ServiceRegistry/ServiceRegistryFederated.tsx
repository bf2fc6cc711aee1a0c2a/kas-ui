import React from 'react';
import { AlertVariant } from '@patternfly/react-core';
import { ServiceRegistry, ServiceRegistryProps } from './ServiceRegistry';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { AlertContext, AlertContextProps } from '../common/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';
import '../../i18n/i18n';

// Version of ServiceRegistry for federation

export type ServiceRegistryFederatedProps = ServiceRegistryProps & {
  getToken: () => Promise<string>;
  getUsername: () => Promise<string>;
  addAlert: (message: string, variant?: AlertVariant) => void;
  basePath: string;
};

const ServiceRegistryFederated = ({
  getUsername,
  getToken,
  addAlert,
  basePath,
  getConnectToInstancePath,
}: ServiceRegistryFederatedProps) => {
  const authContext = {
    getToken,
    getUsername,
  } as IAuthContext;

  const alertContext = {
    addAlert,
  } as AlertContextProps;

  return (
    <ApiContext.Provider
      value={{
        basePath: basePath,
      }}
    >
      <AlertContext.Provider value={alertContext}>
        <AuthContext.Provider value={authContext}>
          <ServiceRegistry getConnectToInstancePath={getConnectToInstancePath} />
        </AuthContext.Provider>
      </AlertContext.Provider>
    </ApiContext.Provider>
  );
};

export default ServiceRegistryFederated;
