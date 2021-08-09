import { ServiceAccountListItem } from "@rhoas/kafka-management-sdk";
import { MODAL_TYPES, useRootModalContext } from "@app/common";
import React, { useState } from "react";
import { Card, PageSection, PageSectionVariants } from "@patternfly/react-core";
import { useLocation } from "react-router-dom";
import { FilterType } from "@app/modules/OpenshiftStreams/components";
import { ServiceAccountsTableView } from "@app/modules/ServiceAccounts/components/ServiceAccountsTableView";

export type ServiceAccountTableSectionProps = {
  fetchServiceAccounts: () => Promise<void>
  serviceAccountItems: ServiceAccountListItem[]
}

export const ServiceAccountsTableSection: React.FunctionComponent<ServiceAccountTableSectionProps> = ({
                                                                                                        fetchServiceAccounts,
                                                                                                        serviceAccountItems
                                                                                                      }) => {

  const { showModal } = useRootModalContext();
  const location = useLocation();

  const [orderBy, setOrderBy] = useState<string>('name asc');
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);

  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');


  const handleResetModal = (serviceAccount: ServiceAccountListItem) => {
    showModal(MODAL_TYPES.RESET_CREDENTIALS, { serviceAccountToReset: serviceAccount });
  };

  const handleCreateModal = () => {
    showModal(MODAL_TYPES.CREATE_SERVICE_ACCOUNT, { fetchServiceAccounts });
  };

  const handleDeleteModal = (serviceAccount: ServiceAccountListItem) => {
    showModal(MODAL_TYPES.DELETE_SERVICE_ACCOUNT, { serviceAccountToDelete: serviceAccount, fetchServiceAccounts });
  };

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
};
