import React, { useContext } from 'react';
import { AlertVariant } from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi } from '../../../../../openapi/api';
import { isValidToken } from '@app/utils';
import { MASDeleteModal, useAlerts, useGlobalModalContext } from '@app/common';
import { useTranslation } from 'react-i18next';
import { isServiceApiError } from '@app/utils';

const DeleteServiceAccountModal: React.FunctionComponent<{}> = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const { store, hideModal } = useGlobalModalContext();
  const { serviceAccountToDelete, fetchServiceAccounts } = store?.modalProps || {};

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
      hideModal();
      try {
        await apisService.deleteServiceAccount(serviceAccountId).then((response) => {
          if (response.status >= 200) {
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
  };

  return (
    <MASDeleteModal
      isModalOpen={true}
      handleModalToggle={hideModal}
      title={t('serviceAccount.delete_service_account') + '?'}
      confirmButtonProps={{
        onClick: () => deleteServiceAccount(serviceAccountToDelete),
        label: 'Delete',
      }}
    >
      <p>
        <b>{serviceAccountToDelete?.name}</b> {t('serviceAccount.will_be_deleted')}
      </p>
    </MASDeleteModal>
  );
};

export { DeleteServiceAccountModal };
