import React, { useState } from 'react';
import {
  AlertVariant,
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import {
  Configuration,
  SecurityApi,
  ServiceAccount,
} from '@rhoas/kafka-management-sdk';
import { useTranslation } from 'react-i18next';
import { getModalAppendTo, isServiceApiError } from '@app/utils';
import {
  asServiceAccountRequest,
  createEmptyNewServiceAccountRequest,
  isServiceAccountRequestInvalid,
  NewServiceAccountRequest,
} from '@app/models';
import {
  BaseModalProps,
  CreateServiceAccountProps,
  useAlert,
  useAuth,
  useConfig,
} from '@rhoas/app-services-ui-shared';
import { CreateForm } from '@app/modules/ServiceAccounts/dialogs/CreateServiceAccount/CreateForm';
import Credentials from '@app/modules/ServiceAccounts/components/Credentials /Credentials';

const FORM_ID = 'create_service_account_form';

enum Step {
  CreateServiceAccount = 'CreateServiceAccount',
  Credentials = 'Credentials',
}

const CreateServiceAccountConnected: React.FunctionComponent<
  CreateServiceAccountProps & BaseModalProps
> = ({ onCreate, title, hideModal }) => {
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
  const [step, setStep] = useState<Step>(Step.CreateServiceAccount);
  const [serviceAccountResponse, setServiceAccountResponse] = useState<
    ServiceAccount | undefined
  >();

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
        setServiceAccountResponse(serviceAccount);
        setStep(Step.Credentials);
        addAlert &&
          addAlert({
            title: t('serviceAccount.service_account_creation_success_message'),
            variant: AlertVariant.success,
          });
        onCreate && onCreate();
      } catch (error) {
        handleServerError(error);
      }
    }
    setCreationInProgress(false);
  };

  const handleCreateModal = () => {
    hideModal();
  };

  const getModalActions = () => {
    if (step === Step.CreateServiceAccount) {
      return [
        <Button
          key='submit'
          variant='primary'
          type='submit'
          form={FORM_ID}
          isDisabled={
            isServiceAccountRequestInvalid(serviceAccountRequest) ||
            isCreationInProgress
          }
          spinnerAriaValueText={t('submitting_request')}
          isLoading={isCreationInProgress}
          data-testid='modalCreateServiceAccount-buttonSubmit'
        >
          {'Create'}
        </Button>,
        <Button
          key='cancel'
          variant='link'
          onClick={handleCreateModal}
          data-testid='modalCreateServiceAccount-buttonCancel'
        >
          {t('cancel')}
        </Button>,
      ];
    }
    return [];
  };

  const Body: React.FunctionComponent = () => {
    if (step === Step.CreateServiceAccount) {
      return (
        <CreateForm
          createServiceAccount={createServiceAccount}
          setServiceAccountRequest={setServiceAccountRequest}
          serviceAccountRequest={serviceAccountRequest}
          id={FORM_ID}
        />
      );
    }
    if (serviceAccountResponse === undefined) {
      throw new Error('resetServiceAccount must not be undefined');
    }
    return (
      <Credentials serviceAccount={serviceAccountResponse} close={hideModal} />
    );
  };

  return (
    <Modal
      id='modalCreateSAccount'
      variant={ModalVariant.medium}
      title={step === Step.CreateServiceAccount ? title : ''}
      isOpen={true}
      onClose={handleCreateModal}
      appendTo={getModalAppendTo}
      actions={getModalActions()}
    >
      <Body />
    </Modal>
  );
};

export { CreateServiceAccountConnected };
export default CreateServiceAccountConnected;
