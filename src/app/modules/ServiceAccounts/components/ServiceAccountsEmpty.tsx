import React from "react";
import { useTranslation } from "react-i18next";
import { PageSection } from "@patternfly/react-core";
import { MASEmptyState, MASEmptyStateVariant, MODAL_TYPES, useRootModalContext } from "@app/common";

export type ServiceAccountsEmptyProps = {
  fetchServiceAccounts: () => Promise<void>
}
export const ServiceAccountsEmpty: React.FunctionComponent<ServiceAccountsEmptyProps> = ({ fetchServiceAccounts }) => {

  const { showModal } = useRootModalContext();

  const handleCreateModal = () => {
    showModal(MODAL_TYPES.CREATE_SERVICE_ACCOUNT, { fetchServiceAccounts });
  };

  const { t } = useTranslation();
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
}
