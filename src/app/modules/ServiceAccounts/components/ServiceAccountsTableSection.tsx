import { ServiceAccountListItem } from '@rhoas/kafka-management-sdk';
import {
  KAFKA_MODAL_TYPES,
  useRootModalContext,
  usePagination,
} from '@app/common';
import React, { useState } from 'react';
import { Card, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';
import {
  FilterType,
  ServiceAccountsTableView,
} from '@app/modules/ServiceAccounts/components/ServiceAccountsTableView';

export type ServiceAccountTableSectionProps = {
  fetchServiceAccounts: () => Promise<void>;
  serviceAccountItems: ServiceAccountListItem[];
};

export const ServiceAccountsTableSection: React.FunctionComponent<ServiceAccountTableSectionProps> =
  ({ fetchServiceAccounts, serviceAccountItems }) => {
    const { showModal } = useRootModalContext();
    const location = useLocation();

    const [orderBy, setOrderBy] = useState<string>('name asc');
    const [filterSelected, setFilterSelected] = useState('name');
    const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);

    const searchParams = new URLSearchParams(location.search);
    const { page = 1, perPage = 10 } = usePagination() || {};
    const mainToggle = searchParams.has('user-testing');

    const onResetCredentials = (serviceAccount: ServiceAccountListItem) => {
      showModal(KAFKA_MODAL_TYPES.RESET_CREDENTIALS, {
        serviceAccountToReset: serviceAccount,
      });
    };

    const onCreateServiceAccount = () => {
      showModal(KAFKA_MODAL_TYPES.CREATE_SERVICE_ACCOUNT, {
        fetchServiceAccounts,
      });
    };

    const onDeleteServiceAccount = (serviceAccount: ServiceAccountListItem) => {
      showModal(KAFKA_MODAL_TYPES.DELETE_SERVICE_ACCOUNT, {
        serviceAccountToDelete: serviceAccount,
        fetchServiceAccounts,
      });
    };

    return (
      <PageSection
        className='mk--main-page__page-section--table pf-m-padding-on-xl'
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
            onResetCredentials={onResetCredentials}
            onDeleteServiceAccount={onDeleteServiceAccount}
            onCreateServiceAccount={onCreateServiceAccount}
            mainToggle={mainToggle}
          />
        </Card>
      </PageSection>
    );
  };
