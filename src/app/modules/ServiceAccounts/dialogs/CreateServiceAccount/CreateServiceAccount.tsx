import React, { useState } from 'react';
import { AlertVariant } from '@patternfly/react-core';
import { Configuration, SecurityApi } from '@rhoas/kafka-management-sdk';
import {
  KAFKA_MODAL_TYPES,
  MASCreateModal,
  useRootModalContext,
} from '@app/common';
import { useTranslation } from 'react-i18next';
import { isServiceApiError } from '@app/utils';
import {
  asServiceAccountRequest,
  createEmptyNewServiceAccountRequest,
  isServiceAccountRequestInvalid,
  NewServiceAccountRequest,
} from '@app/models';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { CreateForm } from '@app/modules/ServiceAccounts/dialogs/CreateServiceAccount/CreateForm';

const FORM_ID = 'create_service_account_form';

const CreateServiceAccount: React.FunctionComponent = () => {
  const { store, showModal, hideModal } = useRootModalContext();
  const { fetchServiceAccounts } = store?.modalProps || {};
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig() || { kas: {} };
  const { addAlert } = useAlert() || {};

  const [serviceAccountRequest, setServiceAccountRequest] =
    useState<NewServiceAccountRequest>(createEmptyNewServiceAccountRequest());
  const [isCreationInProgress, setCreationInProgress] =
    useState<boolean>(false);

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

  const createServiceAccount = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new SecurityApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        setCreationInProgress(true);
        const serviceAccount = await apisService
          .createServiceAccount(asServiceAccountRequest(serviceAccountRequest))
          .then((res) => res?.data);
        //open generate serviceAccount modal
        showModal(KAFKA_MODAL_TYPES.CREDENTIALS, { serviceAccount });
        addAlert &&
          addAlert({
            title: t('serviceAccount.service_account_creation_success_message'),
            variant: AlertVariant.success,
          });
        fetchServiceAccounts && fetchServiceAccounts();
      } catch (error) {
        handleServerError(error);
      }
    }
    setCreationInProgress(false);
  };

  const handleCreateModal = () => {
    hideModal();
  };

  return (
    <MASCreateModal
      id='modalCreateSAccount'
      isModalOpen={true}
      title={t('serviceAccount.create_a_service_account')}
      handleModalToggle={handleCreateModal}
      isFormValid={!isServiceAccountRequestInvalid(serviceAccountRequest)}
      primaryButtonTitle='Create'
      isCreationInProgress={isCreationInProgress}
      dataTestIdSubmit='modalCreateServiceAccount-buttonSubmit'
      dataTestIdCancel='modalCreateServiceAccount-buttonCancel'
      formId={FORM_ID}
    >
      <CreateForm
        createServiceAccount={createServiceAccount}
        setServiceAccountRequest={setServiceAccountRequest}
        serviceAccountRequest={serviceAccountRequest}
        id={FORM_ID}
      />
    </MASCreateModal>
  );
};

export { CreateServiceAccount };
export default CreateServiceAccount;
