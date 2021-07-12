import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants, Text, AlertVariant, TextContent, Card } from '@patternfly/react-core';
import { isServiceApiError, ErrorCodes, sortValues } from '@app/utils';
import { MASEmptyState, MASLoading, MASEmptyStateVariant, useRootModalContext, MODAL_TYPES } from '@app/common';
import { ServiceAccountListItem, ServiceAccountList, SecurityApi, Configuration } from '@rhoas/kafka-management-sdk';
import { ServiceAccountsTableView, FilterType } from './components/ServiceAccountsTableView';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';

const ServiceAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const { showModal } = useRootModalContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  const [serviceAccountList, setServiceAccountList] = useState<ServiceAccountList>();
  const [serviceAccountItems, setServiceAccountItems] = useState<ServiceAccountListItem[] | undefined>();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [orderBy, setOrderBy] = useState<string>('name asc');
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isServiceAccountsEmpty, setIsServiceAccountsEmpty] = useState<boolean>(false);

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
      addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
    }
  };

  const fetchServiceAccounts = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new SecurityApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getServiceAccounts().then((response) => {
          const serviceAccounts: ServiceAccountList = response?.data;
          const items = serviceAccounts?.items || [];
          const itemsLength = items?.length;
          setServiceAccountList(serviceAccounts);
          const sortedServiceAccounts: ServiceAccountListItem[] | undefined = sortValues<ServiceAccountListItem>(
            items,
            'name',
            'asc'
          );
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
                total={/*serviceAccountList?.total ||*/ 1}
                expectedTotal={0}
                serviceAccountsDataLoaded={true}
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
      <PageSection variant={PageSectionVariants.default} padding={{ default: 'noPadding' }} isFilled>
        <MASEmptyState
          titleProps={{
            title: t('serviceAccount.unauthorized_access_to_service_accounts_title'),
            headingLevel: 'h2',
          }}
          emptyStateIconProps={{
            icon: LockIcon,
          }}
          emptyStateBodyProps={{
            body: t('serviceAccount.unauthorized_access_to_service_accounts_info'),
          }}
        />
      </PageSection>
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
