import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Modal,
  ModalVariant,
  AlertVariant,
} from '@patternfly/react-core';
import { useRootModalContext, KAFKA_MODAL_TYPES } from '@app/common';
import { isServiceApiError } from '@app/utils';
import { getModalAppendTo } from '@app/utils/utils';
import { Configuration, SecurityApi } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';

const ResetServiceAccount: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig() || { kas: {} };
  const { addAlert } = useAlert() || {};
  const { store, showModal, hideModal } = useRootModalContext();
  const { serviceAccountToReset } = store?.modalProps || {};

  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleServerError = (error: unknown) => {
    let reason: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
    }
    addAlert &&
      addAlert({
        title: t('something_went_wrong'),
        variant: AlertVariant.danger,
        description: reason,
      });
  };

  const resetServiceAccount = async (serviceAccount) => {
    const serviceAccountId = serviceAccount?.id;
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new SecurityApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        setIsModalLoading(true);
        await apisService
          .resetServiceAccountCreds(serviceAccountId)
          .then((response) => {
            const credential = response?.data;
            hideModal(); // Close first modal
            setIsModalLoading(false);
            showModal(KAFKA_MODAL_TYPES.CREDENTIALS, {
              credential,
              title: t('serviceAccount.reset_service_account_credentials'),
            });
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
  const client_id = serviceAccountToReset?.client_id;

  return (
    <Modal
      id='reset-service-account-modal'
      variant={ModalVariant.medium}
      title={`${t('serviceAccount.reset_service_account_credentials')}?`}
      isOpen={true}
      onClose={handleModalToggle}
      appendTo={getModalAppendTo}
      actions={[
        <Button
          key='create'
          variant='primary'
          type='submit'
          onClick={() => resetServiceAccount(serviceAccountToReset)}
          spinnerAriaValueText={t('common.submitting_request')}
          isLoading={isModalLoading}
        >
          {t('serviceAccount.reset')}
        </Button>,
        <Button key='cancel' variant='link' onClick={handleModalToggle}>
          {t('common.cancel')}
        </Button>,
      ]}
    >
      <span
        dangerouslySetInnerHTML={{
          __html: t('serviceAccount.client_secret_will_be_reset', {
            serviceAccountId,
            client_id,
          }),
        }}
      />
    </Modal>
  );
};

export { ResetServiceAccount };
export default ResetServiceAccount;
