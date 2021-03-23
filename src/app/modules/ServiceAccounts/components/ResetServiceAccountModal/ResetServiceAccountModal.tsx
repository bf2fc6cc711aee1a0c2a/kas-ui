import React, {useState, useContext} from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  AlertVariant
} from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi, ServiceAccountListItem } from './../../../../../openapi/api';
import { isValidToken } from '@app/utils';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError, ErrorCodes } from '@app/utils';

export type ResetServiceAccountModalProps = {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  serviceAccountToReset: ServiceAccountListItem | undefined
}

const ResetServiceAccountModal: React.FunctionComponent<ResetServiceAccountModalProps> = (
  {isOpen, setIsOpen, serviceAccountToReset}: ResetServiceAccountModalProps) => {

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();

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

    if (isValidToken(accessToken)) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
      });
      setIsModalLoading(true);
      await apisService.resetServiceAccountCreds(serviceAccountId).then((response) => {
        setIsOpen(false);
        setIsModalLoading(false);
        // open generate credentials modal (when PR is merged)
      });
      } catch (error) {
        handleServerError(error);
        setIsModalLoading(false);
      }
    }
  }

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  }

  const serviceAccountId = serviceAccountToReset?.name;
  
  return (
    <Modal
      id="reset-service-account-modal"
      variant={ModalVariant.medium}
      title={t('serviceAccount.reset_service_account_credentials')}
      isOpen={isOpen}
      onClose={handleModalToggle}
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
        </Button>
      ]}
    >
      <span dangerouslySetInnerHTML={{ __html: t('serviceAccount.client_secret_will_be_reset', { serviceAccountId }) }} />
    </Modal>
  )
}

export { ResetServiceAccountModal };
