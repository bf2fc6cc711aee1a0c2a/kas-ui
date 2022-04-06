import { ServiceAccountListItem } from "@rhoas/kafka-management-sdk";
import { usePagination } from "@app/common";
import React, { useState } from "react";
import { Card, PageSection, PageSectionVariants } from "@patternfly/react-core";
import { ServiceAccountsTableView } from "@app/modules/ServiceAccounts/components/ServiceAccountsTableView";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";

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

  const [orderBy, setOrderBy] = useState<string>("name asc");

  const { page = 1, perPage = 10 } = usePagination() || {};

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

  return (
    <PageSection
      className="mk--main-page__page-section--table pf-m-padding-on-xl"
      variant={PageSectionVariants.default}
      padding={{ default: "noPadding" }}
    >
      <Card>
        <ServiceAccountsTableView
          page={page}
          perPage={perPage}
          expectedTotal={0}
          serviceAccountsDataLoaded={true}
          serviceAccountItems={serviceAccountItems}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          onResetCredentials={onResetCredentials}
          onDeleteServiceAccount={onDeleteServiceAccount}
          onCreateServiceAccount={onCreateServiceAccount}
        />
      </Card>
    </PageSection>
  );
};
