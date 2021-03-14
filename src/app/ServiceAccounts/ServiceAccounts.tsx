import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Level, LevelItem, PageSection, PageSectionVariants, Title, Text, AlertVariant } from '@patternfly/react-core';
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
import { MASEmptyState, MASLoading } from '@app/common';

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
          <PageSection>
            <MASEmptyState
              titleProps={{
                title: t('you_do_not_have_any_kafka_instances_yet'),
                headingLevel: 'h4',
              }}
              emptyStateBodyProps={{
                body: t('create_a_kafka_instance_to_get_started'),
              }}
              //   buttonProps={{
              //     title: t('create_a_kafka_instance'),
              //     onClick: () => setIsOpenCreateInstanceModal(!isOpenCreateInstanceModal),
              //     ['data-testid']: 'emptyStateStreams-buttonCreateKafka',
              //   }}
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
              total={serviceAccountList?.total || 0}
              page={page}
              perPage={perPage}
              filteredValue={filteredValue}
              setFilteredValue={setFilteredValue}
            />
            <ServiceAccountsTableView
              page={page}
              perPage={perPage}
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

  return (
    <>
      <AlertProvider>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h1" size="lg">
            {t('serviceAccount.service_accounts_title_header')}
          </Title>
          <Text>{t('serviceAccount.service_accounts_title_header_info')}</Text>
        </PageSection>
        {renderTableView()}
      </AlertProvider>
    </>
  );
};

export { ServiceAccounts };
