import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertVariant } from '@patternfly/react-core';
import { MASDeleteModal, useRootModalContext } from '@app/common';
import { isServiceApiError } from '@app/utils';
import { DefaultApi, ServiceAccountListItem } from '../../../../../openapi/api';
import { useAlert, useAuth, useConfig } from "@bf2/ui-shared";

const DeleteServiceAccount = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { kas: { apiBasePath: basePath } } = useConfig();
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
      const apisService = new DefaultApi({
        accessToken,
        basePath,
      });
      setIsLoading(true);

      try {
        await apisService.deleteServiceAccount(serviceAccountId).then((response) => {
          handleModalToggle();
          setIsLoading(false);

          addAlert(
            t('serviceAccount.service_account_successfully_deleted', { name: serviceAccount?.name }),
            AlertVariant.success
          );
          fetchServiceAccounts();
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }

        handleModalToggle();
        setIsLoading(false);
        addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
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
      <p><b>{serviceAccountToDelete?.name}</b> {t('serviceAccount.will_be_deleted')}</p>
    </MASDeleteModal>
  );
};

export { DeleteServiceAccount };
