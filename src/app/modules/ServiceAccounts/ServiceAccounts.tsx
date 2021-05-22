import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  PageSectionVariants,
  Text,
  AlertVariant,
  TextContent,
  Card,
} from '@patternfly/react-core';
import { isServiceApiError, ErrorCodes, sortValues } from '@app/utils';
import {
  MASEmptyState,
  MASLoading,
  MASFullPageError,
  MASEmptyStateVariant,
  useRootModalContext,
  MODAL_TYPES,
} from '@app/common';
import { DefaultApi, ServiceAccountListItem, ServiceAccountList } from '../../../openapi/api';
import { ServiceAccountsTableView, FilterType } from './components/ServiceAccountsTableView';
import { useAlert, useAuth, useConfig } from "@bf2/ui-shared";

export type ServiceAccountsProps = {
  getConnectToInstancePath?: (data: any) => string;
};

const ServiceAccounts: React.FC<ServiceAccountsProps> = ({ getConnectToInstancePath }: ServiceAccountsProps) => {

  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const { showModal } = useRootModalContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');
  const auth = useAuth();
  const { kas: { apiBasePath: basePath } } = useConfig();

  const [serviceAccountList, setServiceAccountList] = useState<ServiceAccountList>();
  const [serviceAccountItems, setServiceAccountItems] = useState<ServiceAccountListItem[]>();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [serviceAccountsDataLoaded, setServiceAccountsDataLoaded] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>('name asc');
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isServiceAccountsEmpty, setIsServiceAccountsEmpty] = useState<boolean>(false);

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    } else {
      addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
    }
  };

  const fetchServiceAccounts = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listServiceAccounts().then((response) => {
          const serviceAccounts = response?.data;
          const items = serviceAccounts?.items || [];
          const itemsLength = items?.length;
          setServiceAccountList(serviceAccounts);
          const sortedServiceAccounts = sortValues(items, 'name', 'asc');
          setServiceAccountItems(sortedServiceAccounts);
          /**
           * Todo: handle below logic in separate API call when backend start support pagination
           */
          if (!itemsLength || itemsLength < 1) {
            setIsServiceAccountsEmpty(true);
          } else {
            setIsServiceAccountsEmpty(false);
          }
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    fetchServiceAccounts();
  }, []);

  const handleResetModal = (serviceAccount: ServiceAccountListItem) => {
    showModal(MODAL_TYPES.RESET_CREDENTIALS, { serviceAccountToReset: serviceAccount });
  };

  const handleCreateModal = () => {
    showModal(MODAL_TYPES.CREATE_SERVICE_ACCOUNT, { fetchServiceAccounts });
  };

  const handleDeleteModal = (serviceAccount: ServiceAccountListItem) => {
    showModal(MODAL_TYPES.DELETE_SERVICE_ACCOUNT, { serviceAccountToDelete: serviceAccount, fetchServiceAccounts });
  };

  const renderTableView = () => {
    if (serviceAccountItems === undefined) {
      return (
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <MASLoading />
        </PageSection>
      );
    } else {
      if (isServiceAccountsEmpty) {
        return (
          <PageSection padding={{ default: 'noPadding' }} isFilled>
            <MASEmptyState
              emptyStateProps={{
                variant: MASEmptyStateVariant.NoItems,
              }}
              titleProps={{
                title: t('serviceAccount.you_do_not_have_any_service_accounts_yet'),
              }}
              emptyStateBodyProps={{
                body: t('serviceAccount.create_service_account_to_get_started'),
              }}
              buttonProps={{
                title: t('serviceAccount.create_service_account'),
                onClick: handleCreateModal,
                ['data-testid']: 'emptyStateStreams-buttonCreateServiceAccount',
              }}
            />
          </PageSection>
        );
      } else {
        return (
          <PageSection
            className="mk--main-page__page-section--table pf-m-padding-on-xl"
            variant={PageSectionVariants.default}
            padding={{ default: 'noPadding' }}
          >
            <Card>
              <ServiceAccountsTableView
                page={page}
                perPage={perPage}
                total={serviceAccountList?.total || 1}
                expectedTotal={expectedTotal}
                serviceAccountsDataLoaded={serviceAccountsDataLoaded}
                serviceAccountItems={serviceAccountItems}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                filterSelected={filterSelected}
                setFilterSelected={setFilterSelected}
                filteredValue={filteredValue}
                setFilteredValue={setFilteredValue}
                onResetCredentials={handleResetModal}
                onDeleteServiceAccount={handleDeleteModal}
                handleCreateModal={handleCreateModal}
                mainToggle={mainToggle}
              />
            </Card>
          </PageSection>
        );
      }
    }
  };

  if (isUserUnauthorized) {
    return (
      <MASFullPageError
        titleProps={{
          title: t('serviceAccount.unauthorized_access_to_service_accounts_title'),
          headingLevel: 'h2',
        }}
        emptyStateBodyProps={{
          body: t('serviceAccount.unauthorized_access_to_service_accounts_info'),
        }}
      />
    );
  }

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1"> {t('serviceAccount.service_accounts')}</Text>
          <Text component="p">{t('serviceAccount.service_accounts_title_header_info')}</Text>
        </TextContent>
      </PageSection>
      {renderTableView()}
    </>
  );
};

export { ServiceAccounts };
