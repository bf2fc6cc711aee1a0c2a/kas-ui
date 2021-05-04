import React, { useContext } from 'react';
import { Button, Modal, ModalVariant, AlertVariant } from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi } from './../../../../../openapi/api';
import { useTranslation } from 'react-i18next';
import { useAlerts, useRootModalContext, MODAL_TYPES } from '@app/common';
import { isServiceApiError } from '@app/utils';
import { getModalAppendTo } from '@app/utils/utils';

const ResetServiceAccountModal: React.FunctionComponent<{}> = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const { store, showModal, hideModal } = useRootModalContext();
  const { serviceAccountToReset } = store?.modalProps || {};

  const [isModalLoading, setIsModalLoading] = React.useState(false);

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
    }
    addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
  };

  const resetServiceAccount = async (serviceAccount) => {
    const serviceAccountId = serviceAccount?.id;
    const accessToken = await authContext?.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        setIsModalLoading(true);
        await apisService.resetServiceAccountCreds(serviceAccountId).then((response) => {
          const credential = response?.data;
          //close pre-confirm modal
          hideModal();
          setIsModalLoading(false);
          //open generate credential modal
          showModal(MODAL_TYPES.GENERATE_CREDENTIALS, { credential });
        });
      } catch (error) {
        handleServerError(error);
        setIsModalLoading(false);
      }
    }
  };

  const handleModalToggle = () => {
    hideModal();
  };

  const serviceAccountId = serviceAccountToReset?.name;
  const clientID = serviceAccountToReset?.clientID;

  return (
    <>
      <Modal
        id="reset-service-account-modal"
        variant={ModalVariant.medium}
        title={t('serviceAccount.reset_service_account_credentials')}
        isOpen={true}
        onClose={handleModalToggle}
        appendTo={getModalAppendTo}
        actions={[
          <Button
            key="create"
            variant="primary"
            type="submit"
            onClick={() => resetServiceAccount(serviceAccountToReset)}
            spinnerAriaValueText={t('common.submitting_request')}
            isLoading={isModalLoading}
          >
            {t('serviceAccount.reset')}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {t('common.cancel')}
          </Button>,
        ]}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: t('serviceAccount.client_secret_will_be_reset', { serviceAccountId, clientID }),
          }}
        />
      </Modal>
    </>
  );
};

export { ResetServiceAccountModal };
