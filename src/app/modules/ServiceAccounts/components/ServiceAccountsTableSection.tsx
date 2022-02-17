import { ServiceAccountListItem } from '@rhoas/kafka-management-sdk';
import { usePagination } from '@app/common';
import React, { useEffect, useState } from 'react';
import { Card, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';
import { ServiceAccountsTableView } from '@app/modules/ServiceAccounts/components/ServiceAccountsTableView';
import { ModalType, useModal } from '@rhoas/app-services-ui-shared';

export type ServiceAccountTableSectionProps = {
  fetchServiceAccounts: () => Promise<void>;
  serviceAccountItems: ServiceAccountListItem[];
};

export const ServiceAccountsTableSection: React.FunctionComponent<
  ServiceAccountTableSectionProps
> = ({ fetchServiceAccounts, serviceAccountItems }) => {
  const { showModal: showResetCredentialsModal } =
    useModal<ModalType.KasResetServiceAccountCredentials>();
  const { showModal: showCreateServiceAccountModal } =
    useModal<ModalType.KasCreateServiceAccount>();
  const { showModal: showDeleteServiceAccountModal } =
    useModal<ModalType.KasDeleteServiceAccount>();
  const location = useLocation();

  const [orderBy, setOrderBy] = useState<string>('name asc');

  const { page = 1, perPage = 10 } = usePagination() || {};

  const [filteredData, setFilteredData] = useState<ServiceAccountListItem[]>(serviceAccountItems);
  const [userFilteredData, setUserFilteredData] = useState<ServiceAccountListItem[]>(serviceAccountItems)

  useEffect(() => {
    setFilteredData(filteredData)
    setUserFilteredData(filteredData)
  }, [])

  const onResetCredentials = (serviceAccount: ServiceAccountListItem) => {
    showResetCredentialsModal(ModalType.KasResetServiceAccountCredentials, {
      serviceAccount,
    });
  };

  const onCreateServiceAccount = () => {
    showCreateServiceAccountModal(ModalType.KasCreateServiceAccount, {
      onCreate: fetchServiceAccounts,
    });
  };

  const onDeleteServiceAccount = (serviceAccount: ServiceAccountListItem) => {
    showDeleteServiceAccountModal(ModalType.KasDeleteServiceAccount, {
      serviceAccount,
      onDelete: fetchServiceAccounts,
    });
  };

  const onSearch = (State) => {
    const { description, clientid, owner } = State
    if (description.length === 0 && clientid.length === 0 && owner.length === 0) {
      setUserFilteredData(filteredData)
    } else {
      const filterData = userFilteredData.filter((serviceAccountItem) => {
        return (
          description.some((des) => serviceAccountItem.name?.includes(des)) ||
          clientid.some((client) => serviceAccountItem.client_id?.includes(client)) ||
          owner.some((owner) => serviceAccountItem.owner?.includes(owner))
        )
      })
      setUserFilteredData(filterData)
    }
  }

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
          expectedTotal={0}
          serviceAccountsDataLoaded={true}
          serviceAccountItems={userFilteredData}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          onResetCredentials={onResetCredentials}
          onDeleteServiceAccount={onDeleteServiceAccount}
          onCreateServiceAccountClick={onCreateServiceAccount}
          onSearch={onSearch}
        />
      </Card>
    </PageSection>
  );
};
