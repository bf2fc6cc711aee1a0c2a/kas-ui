import { useTranslation } from 'react-i18next';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import React, { useEffect, useState } from 'react';
import { Configuration, SecurityApi, ServiceAccountList, ServiceAccountListItem } from '@rhoas/kafka-management-sdk';
import { ErrorCodes, isServiceApiError, sortValues } from '@app/utils';
import { AlertVariant, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { UserUnauthorized } from '@app/modules/ServiceAccounts/components/UserUnauthorized';
import { MASLoading } from '@app/common';
import { ServiceAccountsEmpty } from '@app/modules/ServiceAccounts/components/ServiceAccountsEmpty';
import { ServiceAccountsTableSection } from '@app/modules/ServiceAccounts/components/ServiceAccountsTableSection';

export const ServiceAccountsTableConnected: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { addAlert } = useAlert() || {};
  const auth = useAuth();
  const config = useConfig();

  const [serviceAccountItems, setServiceAccountItems] = useState<ServiceAccountListItem[] | undefined>();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);

  const handleServerError = (error: Error) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    } else {
      addAlert &&
        addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
    }
  };

  const fetchServiceAccounts = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && config) {
      try {
        const apisService = new SecurityApi(
          new Configuration({
            accessToken,
            basePath: config?.ams?.apiBasePath,
          })
        );
        await apisService.getServiceAccounts().then((response) => {
          const serviceAccounts: ServiceAccountList = response?.data;
          const items = serviceAccounts?.items || [];
          const sortedServiceAccounts: ServiceAccountListItem[] | undefined = sortValues<ServiceAccountListItem>(
            items,
            'name',
            'asc'
          );
          setServiceAccountItems(sortedServiceAccounts);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    fetchServiceAccounts();
  }, [auth, config]);

  if (isUserUnauthorized) {
    return <UserUnauthorized />;
  }

  if (serviceAccountItems === undefined) {
    return (
      <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
        <MASLoading />
      </PageSection>
    );
  }
  if (serviceAccountItems.length < 1) {
    return <ServiceAccountsEmpty fetchServiceAccounts={fetchServiceAccounts} />;
  }
  return (
    <ServiceAccountsTableSection
      fetchServiceAccounts={fetchServiceAccounts}
      serviceAccountItems={serviceAccountItems}
    />
  );
};
