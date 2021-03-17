import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants, Title, Text, AlertVariant } from '@patternfly/react-core';
import { DefaultApi, ServiceAccountListItem, ServiceAccountList } from '../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError, ErrorCodes } from '@app/utils';
import {
  AlertProvider,
  useAlerts,
  ServiceAccountsTableView,
  ServiceAccountsToolbar,
  FilterType,
} from '@app/components';
import { MASEmptyState, MASLoading, MASFullPageError } from '@app/common';
import { CreateServiceAccountModal } from './components/CreateServiceAccountModal';

export type ServiceAccountsProps = {
  getConnectToInstancePath?: (data: any) => string;
};

const ServiceAccounts: React.FC<ServiceAccountsProps> = ({ getConnectToInstancePath }: ServiceAccountsProps) => {
  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;

  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const [serviceAccountList, setServiceAccountList] = useState<ServiceAccountList>();
  const [serviceAccountItems, setServiceAccountItems] = useState<ServiceAccountListItem[]>();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [rawServiceAccountDataLength, setRawServiceAccountDataLength] = useState<number>(0);
  // state to store the expected total  service accounts based on the operation
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [serviceAccountsDataLoaded, setServiceAccountsDataLoaded] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>('name');
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isCreateServiceAccountModalOpen, setIsCreateServiceAccountModalOpen] = useState(false);

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    //check unauthorize user
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    } else {
      addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
    }
  };

  const fetchServiceAccounts = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listServiceAccounts().then((response) => {
          const serviceAccounts = response?.data;
          setServiceAccountList(serviceAccounts);
          setServiceAccountItems(serviceAccounts?.items);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    fetchServiceAccounts();
  }, []);

  const onResetCredentials = () => {};

  const onDeleteServiceAccount = () => {};

  const handleCreateModal = () => {
    setIsCreateServiceAccountModalOpen(!isCreateServiceAccountModalOpen);
  }

  const renderTableView = () => {

    if (serviceAccountItems === undefined) {
      return (
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
           <ServiceAccountsToolbar
              filterSelected={filterSelected}
              setFilterSelected={setFilterSelected}
              total={serviceAccountList?.total || 1}
              page={page}
              perPage={perPage}
              filteredValue={filteredValue}
              setFilteredValue={setFilteredValue}
              handleCreateModal={handleCreateModal}
            />
          <MASLoading />
        </PageSection>
      );
    } else {
      if (rawServiceAccountDataLength && rawServiceAccountDataLength < 1) {
        return (
          <PageSection>
            <MASEmptyState
              titleProps={{
                title: t('serviceAccount.you_do_not_have_any_service_accounts_yet'),
                headingLevel: 'h4',
              }}
              emptyStateBodyProps={{
                body: t('serviceAccount.create_service_account_to_get_started'),
              }}
              buttonProps={{
                title: t('serviceAccount.create_service_account'),
                onClick: () => handleCreateModal(),
                ['data-testid']: 'emptyStateStreams-buttonCreateServiceAccount',
              }}
            />
          </PageSection>
        );
      } else {
        return (
          <PageSection
            className="mk--main-page__page-section--table"
            variant={PageSectionVariants.light}
            padding={{ default: 'noPadding' }}
          >
            <ServiceAccountsToolbar
              filterSelected={filterSelected}
              setFilterSelected={setFilterSelected}
              total={serviceAccountList?.total || 1}
              page={page}
              perPage={perPage}
              filteredValue={filteredValue}
              setFilteredValue={setFilteredValue}
              handleCreateModal={handleCreateModal}
            />
            <ServiceAccountsTableView
              page={page}
              perPage={perPage}
              total={serviceAccountList?.total || 1}
              expectedTotal={expectedTotal}
              serviceAccountsDataLoaded={serviceAccountsDataLoaded}
              serviceAccountItems={serviceAccountItems}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              onResetCredentials={onResetCredentials}
              onDeleteServiceAccount={onDeleteServiceAccount}
            />
          </PageSection>
        );
      }
    }
  };

  /**
   * Show Unathorize page in case user is not authorize
   */
  if (isUserUnauthorized) {
    return (
      <MASFullPageError
        titleProps={{
          title: t('serviceAccount.you_do_not_have_access_to_service_accounts'),
          headingLevel: 'h2',
        }}
        emptyStateBodyProps={{
          body: t('contact_your_organization_administration_for_more_information'),
        }}
      />
    );
  }

  return (
    <>
      <AlertProvider>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h1" size="lg">
            {t('serviceAccount.service_accounts_title_header')}
          </Title>
          <Text>{t('serviceAccount.service_accounts_title_header_info')}</Text>
          <CreateServiceAccountModal isOpen={isCreateServiceAccountModalOpen} setIsOpen={setIsCreateServiceAccountModalOpen} handleCreateModal={handleCreateModal}/>
        </PageSection>
        {renderTableView()}
      </AlertProvider>
    </>
  );
};

export { ServiceAccounts };
