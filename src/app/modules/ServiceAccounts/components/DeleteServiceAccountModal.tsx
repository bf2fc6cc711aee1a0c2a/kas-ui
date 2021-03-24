import React, {useState, useContext} from 'react';
import {
  AlertVariant
} from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi, ServiceAccountListItem } from './../../../../openapi/api';
import { NewServiceAccount } from './../../../models/ServiceAccountsModel';
import { isValidToken } from '@app/utils';
import { MASDeleteModal } from '@app/common/MASDeleteModal/MASDeleteModal';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { useTranslation } from 'react-i18next';
import { isServiceApiError } from '@app/utils';

export type DeleteServiceAccountModalProps = {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  fetchServiceAccounts: () => void,
  serviceAccountToDelete: ServiceAccountListItem | undefined
}

const DeleteServiceAccountModal: React.FunctionComponent<DeleteServiceAccountModalProps> = (
  {isOpen, setIsOpen, fetchServiceAccounts, serviceAccountToDelete}: DeleteServiceAccountModalProps) => {

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  }

  const deleteServiceAccount = async (serviceAccount) => {
    const serviceAccountId = serviceAccount?.id;
    if (serviceAccountId === undefined) {
      throw new Error('service account id not defined');
    }
    const accessToken = await authContext?.getToken();
    if (isValidToken(accessToken)) {
      const apisService = new DefaultApi({
        accessToken,
        basePath,
      });
      handleModalToggle();
      try {
        await apisService.deleteServiceAccount(serviceAccountId).then((response) => {
          if(response.status >= 200 ) {
            fetchServiceAccounts();
          }
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  }

  return (
    <MASDeleteModal
      isModalOpen={isOpen}
      handleModalToggle={handleModalToggle}
      title={t('serviceAccount.delete_service_account')}
      confirmButtonProps={{
        onClick: () => deleteServiceAccount(serviceAccountToDelete),
        label: "Delete",
      }}
    >
      <p><b>{serviceAccountToDelete?.name}</b> {t('serviceAccount.will_be_deleted')}</p>

    </MASDeleteModal>
  )
}

export { DeleteServiceAccountModal };
