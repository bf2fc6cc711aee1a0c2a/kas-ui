import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { MASDeleteModal, useRootModalContext } from '@app/common';
import { isServiceApiError } from '@app/utils';
import { Configuration, DefaultApi, SecurityApi, ServiceAccountListItem } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';

const DeleteServiceAccount: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert();
  const { store, hideModal } = useRootModalContext();
  const { fetchServiceAccounts, serviceAccountToDelete } = store?.modalProps || {};

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleModalToggle = () => {
    hideModal();
  };

  const deleteServiceAccount = async (serviceAccount: ServiceAccountListItem | undefined) => {
    const serviceAccountId = serviceAccount?.id;
    if (serviceAccountId === undefined) {
      throw new Error('service account id not defined');
    }
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      const apisService = new SecurityApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );
      setIsLoading(true);

      try {
        await apisService.deleteServiceAccountById(serviceAccountId).then(() => {
          handleModalToggle();
          setIsLoading(false);
          addAlert({
            variant: AlertVariant.success,
            title: t('serviceAccount.service_account_successfully_deleted', { name: serviceAccount?.name }),
          });
          fetchServiceAccounts();
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }

        handleModalToggle();
        setIsLoading(false);
        addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
      }
    }
  };

  return (
    <MASDeleteModal
      isModalOpen={true}
      handleModalToggle={handleModalToggle}
      title={t('serviceAccount.delete_service_account') + '?'}
      confirmButtonProps={{
        onClick: () => deleteServiceAccount(serviceAccountToDelete),
        label: 'Delete',
        isLoading,
      }}
    >
      <p>
        <b>{serviceAccountToDelete?.name}</b> {t('serviceAccount.will_be_deleted')}
      </p>
    </MASDeleteModal>
  );
};

export { DeleteServiceAccount };
