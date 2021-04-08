import React, { useState, useContext, useEffect } from 'react';
import { Alert, Form, FormAlert, FormGroup, TextInput, TextArea } from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi } from './../../../../openapi/api';
import { NewServiceAccount, FormDataValidationState } from './../../../models';
import { MASCreateModal } from '@app/common/MASCreateModal/MASCreateModal';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useTranslation } from 'react-i18next';
import { isServiceApiError, MAX_SERVICE_ACCOUNT_NAME_LENGTH, MAX_SERVICE_ACCOUNT_DESC_LENGTH } from '@app/utils';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { AlertVariant } from '@patternfly/react-core';
import { MASGenerateCredentialsModal } from '@app/common/MASGenerateCredentialsModal';

export type CreateServiceAccountModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchServiceAccounts: () => void;
};

const CreateServiceAccountModal: React.FunctionComponent<CreateServiceAccountModalProps> = ({
  isOpen,
  setIsOpen,
  fetchServiceAccounts,
}: CreateServiceAccountModalProps) => {
  const newServiceAccount: NewServiceAccount = new NewServiceAccount();

  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [descriptionValidated, setDescriptionValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [serviceAccountFormData, setServiceAccountFormData] = useState<NewServiceAccount>(newServiceAccount);
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isCreationInProgress, setCreationInProgress] = useState(false);
  const [credential, setCredential] = useState();
  const [isGenerateCredentialsModalOpen, setIsGenerateCredentialsModalOpen] = useState(false);

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();

  const resetForm = () => {
    setNameValidated({ fieldState: 'default' });
    setDescriptionValidated({ fieldState: 'default' });
    setServiceAccountFormData(newServiceAccount);
    setIsFormValid(true);
  };

  useEffect(() => {
    if (nameValidated.fieldState !== 'error' && descriptionValidated.fieldState !== 'error') {
      setIsFormValid(true);
    }
  }, [nameValidated.fieldState, descriptionValidated.fieldState]);

  const handleTextInputName = (name: string) => {
    setServiceAccountFormData({ ...serviceAccountFormData, name });
    let isValid = true;
    if (name && !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
    }

    if (name && name.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH) {
      setNameValidated({
        fieldState: 'error',
        message: t('serviceAccount.service_account_name_length_is_greater_than_expected', {
          maxLength: MAX_SERVICE_ACCOUNT_NAME_LENGTH,
        }),
      });
    } else if (isValid && nameValidated.fieldState === 'error') {
      setNameValidated({ fieldState: 'default', message: '' });
    } else if (!isValid) {
      setNameValidated({ fieldState: 'error', message: t('common.input_filed_invalid_helper_text') });
    }
  };

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
    }
    addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
  };

  const handleTextInputDescription = (description: string) => {
    setServiceAccountFormData({ ...serviceAccountFormData, description });
    if (description && description.length > MAX_SERVICE_ACCOUNT_DESC_LENGTH) {
      setDescriptionValidated({
        fieldState: 'error',
        message: t('serviceAccount.service_account_description_length_is_greater_than_expected', {
          maxLength: MAX_SERVICE_ACCOUNT_DESC_LENGTH,
        }),
      });
    } else if (descriptionValidated.fieldState === 'error') {
      setDescriptionValidated({
        fieldState: 'default',
        message: '',
      });
    }
  };

  const validateCreateForm = () => {
    let isValid = true;
    const { name, description } = serviceAccountFormData;
    if (!name || name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    } else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
      setNameValidated({
        fieldState: 'error',
        message: t('common.input_filed_invalid_helper_text'),
      });
    }

    if (name.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH) {
      isValid = false;
      setNameValidated({
        fieldState: 'error',
        message: t('serviceAccount.service_account_name_length_is_greater_than_expected', {
          maxLength: MAX_SERVICE_ACCOUNT_NAME_LENGTH,
        }),
      });
    }

    if (description && description.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH) {
      isValid = false;
      setDescriptionValidated({
        fieldState: 'error',
        message: t('serviceAccount.service_account_name_length_is_greater_than_expected', {
          maxLength: MAX_SERVICE_ACCOUNT_DESC_LENGTH,
        }),
      });
    }

    return isValid;
  };

  const createServiceAccount = async () => {
    let isValid = validateCreateForm();
    if (!isValid) {
      setIsFormValid(false);
      return;
    }

    const accessToken = await authContext?.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        setCreationInProgress(true);
        await apisService.createServiceAccount(serviceAccountFormData).then((res) => {
          setCredential(res?.data);
          setIsOpen(false);
          setIsGenerateCredentialsModalOpen(true);
          resetForm();
          addAlert(t('serviceAccount.service_account_creation_success_message'), AlertVariant.success);
          fetchServiceAccounts();
        });
      } catch (error) {
        handleServerError(error);
      }
    }

    setCreationInProgress(false);
  };

  const handleCreateModal = () => {
    resetForm();
    setIsOpen(!isOpen);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    createServiceAccount();
  };

  const createForm = () => {
    const { message, fieldState } = nameValidated;
    const { name, description } = serviceAccountFormData;
    const { message: descMessage, fieldState: descFieldState } = descriptionValidated;

    return (
      <Form onSubmit={onFormSubmit}>
        {!isFormValid && (
          <FormAlert>
            <Alert variant="danger" title={t('common.form_invalid_alert')} aria-live="polite" isInline />
          </FormAlert>
        )}
        <FormGroup
          label="Name"
          isRequired
          fieldId="text-input-name"
          helperTextInvalid={message}
          helperTextInvalidIcon={message && <ExclamationCircleIcon />}
          validated={fieldState}
          helperText={t('common.input_filed_invalid_helper_text')}
        >
          <TextInput
            isRequired
            type="text"
            id="text-input-name"
            name="text-input-name"
            value={name}
            onChange={handleTextInputName}
            validated={fieldState}
          />
        </FormGroup>
        <FormGroup
          label="Description"
          fieldId="text-input-description"
          helperTextInvalid={descMessage}
          helperTextInvalidIcon={descMessage && <ExclamationCircleIcon />}
          validated={descFieldState}
        >
          <TextArea
            id="text-input-description"
            name="text-input-description"
            value={description}
            onChange={handleTextInputDescription}
            validated={descFieldState}
          />
        </FormGroup>
      </Form>
    );
  };

  return (
    <>
      <MASCreateModal
        isModalOpen={isOpen}
        title={t('serviceAccount.create_a_service_account')}
        handleModalToggle={handleCreateModal}
        onCreate={createServiceAccount}
        isFormValid={isFormValid}
        primaryButtonTitle="Create"
        isCreationInProgress={isCreationInProgress}
      >
        {createForm()}
      </MASCreateModal>
      <MASGenerateCredentialsModal
        isOpen={isGenerateCredentialsModalOpen}
        setIsOpen={setIsGenerateCredentialsModalOpen}
        credential={credential}
        setCredential={setCredential}
      />
    </>
  );
};

export { CreateServiceAccountModal };
