import React, {useState, useContext} from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput
} from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi, ServiceAccountListItem } from './../../../../../openapi/api';
import { isValidToken } from '@app/utils';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';

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
        if(response.status >= 200 ) {
          setIsOpen(false);
          setIsModalLoading(false);
          // open generate credentials modal (when PR is merged)
        }
      });
      } catch (error) {
        // handleServerError(error);
        console.log(error);
      }
    }
  }

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  }
  
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
          spinnerAriaValueText='submitting_request'
          isLoading={isModalLoading}
        >
          {t('serviceAccount.reset')}
        </Button>,
        <Button key="cancel" variant="link" onClick={handleModalToggle}>
          {t('common.cancel')}
        </Button>
      ]}
    >
      <p>{t('serviceAccount.client_secret_will_be_reset', { serviceAccountId: serviceAccountToReset?.name })}</p>
    </Modal>
  )
}

export { ResetServiceAccountModal };
