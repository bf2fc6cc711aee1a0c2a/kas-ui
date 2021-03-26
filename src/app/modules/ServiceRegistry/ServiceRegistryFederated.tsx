import React from 'react';
import { AlertVariant } from '@patternfly/react-core';
import { ServiceRegistry, ServiceRegistryProps } from '@app/modules/ServiceRegistry/ServiceRegistry';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';
import { AlertContext, AlertContextProps } from '@app/common/MASAlerts';
import { ApiContext } from '@app/api/ApiContext';
import kasi18n from '../../../i18n/i18n';
import {I18nextProvider} from 'react-i18next';
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
    <I18nextProvider i18n={kasi18n}>
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
    </I18nextProvider>
  );
};

export default ServiceRegistryFederated;
