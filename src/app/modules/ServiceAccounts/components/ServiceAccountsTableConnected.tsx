import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import {
  Configuration,
  ServiceAccountsApi,
  ServiceAccountData,
} from "@rhoas/service-accounts-sdk";

import { ErrorCodes, isServiceApiError } from "@app/utils";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { UserUnauthorized } from "@app/modules/ServiceAccounts/components/UserUnauthorized";
import { MASLoading } from "@app/common";
import { ServiceAccountsEmpty } from "@app/modules/ServiceAccounts/components/ServiceAccountsEmpty";
import { ServiceAccountsTableSection } from "@app/modules/ServiceAccounts/components/ServiceAccountsTableSection";

export const ServiceAccountsTableConnected: FunctionComponent = () => {
  const auth = useAuth();
  const config = useConfig();

  const [serviceAccountItems, setServiceAccountItems] = useState<
    ServiceAccountData[] | undefined
  >();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);

  const handleServerError = (error: Error) => {
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      errorCode = error.response?.data?.code;
    }
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    }
  };

  const fetchServiceAccounts = useCallback(async () => {
    const accessToken = await auth?.sas_ui.getToken();
    if (accessToken && config) {
      try {
        const apisService = new ServiceAccountsApi(
          new Configuration({
            accessToken,
            basePath: config?.sas_ui.apiBasePath,
          })
        );
        await apisService.getServiceAccounts().then((response) => {
          const serviceAccounts: ServiceAccountData[] = response?.data;
          const sortedServiceAccounts: ServiceAccountData[] | undefined =
            serviceAccounts?.sort((a, b) =>
              a.createdAt && b.createdAt
                ? String(b.createdAt).localeCompare(String(a.createdAt))
                : -1
            );
          setServiceAccountItems(sortedServiceAccounts);
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          handleServerError(error);
        }
      }
    }
  }, [auth, config]);

  useEffect(() => {
    fetchServiceAccounts();
  }, [fetchServiceAccounts]);

  if (isUserUnauthorized) {
    return <UserUnauthorized />;
  }

  if (serviceAccountItems === undefined) {
    return (
      <PageSection
        variant={PageSectionVariants.light}
        padding={{ default: "noPadding" }}
      >
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
