import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  PageSectionVariants,
  Text,
  AlertVariant,
  Level,
  LevelItem,
  TextContent,
} from '@patternfly/react-core';
import { DefaultApi, ServiceAccountListItem, ServiceAccountList } from '../../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError, ErrorCodes, sortValues } from '@app/utils';
import { ServiceAccountsTableView, FilterType } from './components/ServiceAccountsTableView';
import {
  MASEmptyState,
  MASLoading,
  AlertProvider,
  useAlerts,
  MASFullPageError,
  MASEmptyStateVariant,
} from '@app/common';
import { CreateServiceAccountModal } from './components/CreateServiceAccountModal';
import { ResetServiceAccountModal } from './components/ResetServiceAccountModal/ResetServiceAccountModal';
import { DeleteServiceAccountModal } from './components/DeleteServiceAccountModal';

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
  const mainToggle = searchParams.has('user-testing');

  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const [serviceAccountList, setServiceAccountList] = useState<ServiceAccountList>();
  const [serviceAccountItems, setServiceAccountItems] = useState<ServiceAccountListItem[]>();
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [rawServiceAccountDataLength, setRawServiceAccountDataLength] = useState<number | undefined>(undefined);
  // state to store the expected total  service accounts based on the operation
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [serviceAccountsDataLoaded, setServiceAccountsDataLoaded] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>('name asc');
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isCreateServiceAccountModalOpen, setIsCreateServiceAccountModalOpen] = useState(false);
  const [isResetServiceAccountModalOpen, setIsResetServiceAccountModalOpen] = useState(false);
  const [serviceAccountToReset, setServiceAccountToReset] = useState<ServiceAccountListItem>();
  const [isDeleteServiceAccountModalOpen, setIsDeleteServiceAccountModalOpen] = useState(false);
  const [serviceAccountToDelete, setServiceAccountToDelete] = useState<ServiceAccountListItem>();

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
      addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
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
          const sortedServiceAccounts = sortValues(serviceAccounts?.items, 'name', 'asc');
          setServiceAccountItems(sortedServiceAccounts);
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
    setIsResetServiceAccountModalOpen(!isResetServiceAccountModalOpen);
    setServiceAccountToReset(serviceAccount);
  };

  const handleCreateModal = () => {
    setIsCreateServiceAccountModalOpen(!isCreateServiceAccountModalOpen);
  };

  const handleDeleteModal = (serviceAccount: ServiceAccountListItem) => {
    setIsDeleteServiceAccountModalOpen(!isDeleteServiceAccountModalOpen);
    setServiceAccountToDelete(serviceAccount);
  };

  const renderTableView = () => {
    if (serviceAccountItems === undefined) {
      return (
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <MASLoading />
        </PageSection>
      );
    } else {
      if (rawServiceAccountDataLength && rawServiceAccountDataLength < 1) {
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
          </PageSection>
        );
      }
    }
  };

  /**
   *  Unauthorized page in case user is not authorized
   */
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
      <AlertProvider>
        <PageSection variant={PageSectionVariants.light}>
          <Level>
            <LevelItem>
              <TextContent>
                <Text component="h1"> {t('serviceAccount.service_accounts')}</Text>
                <Text component="p">{t('serviceAccount.service_accounts_title_header_info')}</Text>
              </TextContent>
            </LevelItem>
          </Level>
          <CreateServiceAccountModal
            isOpen={isCreateServiceAccountModalOpen}
            setIsOpen={setIsCreateServiceAccountModalOpen}
            fetchServiceAccounts={fetchServiceAccounts}
          />
          <ResetServiceAccountModal
            isOpen={isResetServiceAccountModalOpen}
            setIsOpen={setIsResetServiceAccountModalOpen}
            serviceAccountToReset={serviceAccountToReset}
          />
          <DeleteServiceAccountModal
            isOpen={isDeleteServiceAccountModalOpen}
            setIsOpen={setIsDeleteServiceAccountModalOpen}
            serviceAccountToDelete={serviceAccountToDelete}
            fetchServiceAccounts={fetchServiceAccounts}
          />
        </PageSection>
        {renderTableView()}
      </AlertProvider>
    </>
  );
};

export { ServiceAccounts };
