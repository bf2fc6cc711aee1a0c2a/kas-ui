import React, { useState } from 'react';
import {
  Alert,
  AlertVariant,
  Form,
  FormAlert,
  FormGroup,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { Configuration, SecurityApi } from '@rhoas/kafka-management-sdk';
import {
  KAFKA_MODAL_TYPES,
  MASCreateModal,
  useRootModalContext,
} from '@app/common';
import { useTranslation } from 'react-i18next';
import {
  isServiceApiError,
  MAX_INSTANCE_NAME_LENGTH,
  MAX_SERVICE_ACCOUNT_DESC_LENGTH,
  MAX_SERVICE_ACCOUNT_NAME_LENGTH,
} from '@app/utils';
import {
  asServiceAccountRequest,
  createEmptyNewServiceAccountRequest,
  isServiceAccountRequestInvalid,
  NewServiceAccountRequest,
} from '@app/models';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';

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
      onCreate={createServiceAccount}
      isFormValid={!isServiceAccountRequestInvalid(serviceAccountRequest)}
      primaryButtonTitle='Create'
      isCreationInProgress={isCreationInProgress}
      dataTestIdSubmit='modalCreateServiceAccount-buttonSubmit'
      dataTestIdCancel='modalCreateServiceAccount-buttonCancel'
    >
      <CreateForm
        createServiceAccount={createServiceAccount}
        setServiceAccountRequest={setServiceAccountRequest}
        serviceAccountRequest={serviceAccountRequest}
      />
    </MASCreateModal>
  );
};

export type CreateFormProps = {
  createServiceAccount: () => Promise<void>;
  serviceAccountRequest: NewServiceAccountRequest;
  setServiceAccountRequest: React.Dispatch<
    React.SetStateAction<NewServiceAccountRequest>
  >;
};

export const CreateForm: React.FunctionComponent<CreateFormProps> = ({
  serviceAccountRequest,
  createServiceAccount,
  setServiceAccountRequest,
}) => {
  const { t } = useTranslation();

  const validateDescription = (
    serviceAccountRequest: NewServiceAccountRequest
  ) => {
    //validate required field
    if (
      serviceAccountRequest.description.value !== undefined &&
      !/^[a-zA-Z0-9.,\-\s]*$/.test(
        serviceAccountRequest.description.value.trim()
      )
    ) {
      serviceAccountRequest.description.validated = 'error';
      serviceAccountRequest.description.errorMessage = t(
        'common.input_filed_invalid_helper_text'
      );
    }
    //validate max length
    else if (
      serviceAccountRequest.description.value !== undefined &&
      serviceAccountRequest.description.value.length >
        MAX_SERVICE_ACCOUNT_DESC_LENGTH
    ) {
      serviceAccountRequest.description.validated = 'error';
      serviceAccountRequest.description.errorMessage = t(
        'serviceAccount.service_account_description_length_is_greater_than_expected',
        {
          maxLength: MAX_INSTANCE_NAME_LENGTH,
        }
      );
    } else {
      serviceAccountRequest.description.validated = 'default';
    }
    return serviceAccountRequest;
  };

  const validateName = (serviceAccountRequest: NewServiceAccountRequest) => {
    //validate required field
    if (
      serviceAccountRequest.name.value === undefined ||
      serviceAccountRequest.name.value.trim() === ''
    ) {
      serviceAccountRequest.name.validated = 'error';
      serviceAccountRequest.name.errorMessage = t(
        'common.this_is_a_required_field'
      );
    } else if (
      serviceAccountRequest.name.value !== undefined &&
      !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(
        serviceAccountRequest.name.value.trim()
      )
    ) {
      serviceAccountRequest.name.validated = 'error';
      serviceAccountRequest.name.errorMessage = t(
        'common.input_filed_invalid_helper_text'
      );
    }
    //validate max length
    else if (
      serviceAccountRequest.name.value !== undefined &&
      serviceAccountRequest.name.value.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH
    ) {
      serviceAccountRequest.name.validated = 'error';
      serviceAccountRequest.name.errorMessage = t(
        'serviceAccount.service_account_name_length_is_greater_than_expected',
        {
          maxLength: MAX_INSTANCE_NAME_LENGTH,
        }
      );
    } else {
      serviceAccountRequest.name.validated = 'success';
    }
    return serviceAccountRequest;
  };

  const setName = (name: string) => {
    setServiceAccountRequest((prevState) => {
      const value = {
        ...prevState,
        name: {
          value: name,
        },
      };
      return validateName(value);
    });
  };

  const setDescription = (description: string) => {
    setServiceAccountRequest((prevState) => {
      const value = {
        ...prevState,
        description: {
          value: description,
        },
      };
      return validateDescription(value);
    });
  };

  const FormValidAlert: React.FunctionComponent = () => {
    if (!isServiceAccountRequestInvalid(serviceAccountRequest)) {
      return <></>;
    }
    return (
      <FormAlert>
        <Alert
          variant='danger'
          title={t('common.form_invalid_alert')}
          aria-live='polite'
          isInline
        />
      </FormAlert>
    );
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    const validated = validateName(validateDescription(serviceAccountRequest));

    if (!isServiceAccountRequestInvalid(validated)) {
      createServiceAccount().then(() => resetForm());
    }
  };

  const resetForm = () => {
    setServiceAccountRequest(createEmptyNewServiceAccountRequest());
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <FormValidAlert />
      <FormGroup
        label='Name'
        isRequired
        fieldId='text-input-name'
        helperTextInvalid={serviceAccountRequest.name.errorMessage}
        validated={serviceAccountRequest.name.validated}
        helperText={t('common.input_filed_invalid_helper_text')}
      >
        <TextInput
          isRequired
          type='text'
          id='text-input-name'
          name='text-input-name'
          value={serviceAccountRequest.name.value}
          onChange={setName}
          validated={serviceAccountRequest.name.validated}
          autoFocus={true}
        />
      </FormGroup>
      <FormGroup
        label='Description'
        fieldId='text-input-description'
        helperTextInvalid={serviceAccountRequest.description.errorMessage}
        validated={serviceAccountRequest.description.validated}
        helperText={t('common.input_text_area_invalid_helper_text')}
      >
        <TextArea
          id='text-input-description'
          name='text-input-description'
          value={serviceAccountRequest.description.value}
          onChange={setDescription}
          validated={serviceAccountRequest.description.validated}
        />
      </FormGroup>
    </Form>
  );
};

export { CreateServiceAccount };
export default CreateServiceAccount;
