import React, { useState, useContext } from 'react';
import { Alert, Form, FormAlert, FormGroup, TextInput } from '@patternfly/react-core';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { DefaultApi, ServiceAccount } from './../../../../openapi/api';
import { NewServiceAccount, FormDataValidationState } from './../../../models';
import { isValidToken, ErrorCodes } from '@app/utils';
import { MASCreateModal } from '@app/common/MASCreateModal/MASCreateModal';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useTranslation } from 'react-i18next';
import { isServiceApiError } from '@app/utils/error';
import { MASFullPageError } from '@app/common';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { AlertVariant } from '@patternfly/react-core';

export type CreateInstanceModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchServiceAccounts: () => void;
};

const CreateServiceAccountModal: React.FunctionComponent<CreateInstanceModalProps> = ({
  isOpen,
  setIsOpen,
  fetchServiceAccounts,
}: CreateInstanceModalProps) => {
  const newServiceAccount: NewServiceAccount = new NewServiceAccount();
  newServiceAccount.name = '';
  newServiceAccount.description = '';

  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [textInputNameValue, setTextInputNameValue] = useState('');
  const [textInputDescriptionValue, setTextInputDescriptionValue] = useState('');
  const [serviceAccountFormData, setServiceAccountFormData] = useState<NewServiceAccount>(newServiceAccount);
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isCreationInProgress, setCreationInProgress] = useState(false);
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);

  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  const resetForm = () => {
    setTextInputNameValue('');
    setTextInputDescriptionValue('');
    setServiceAccountFormData(newServiceAccount);
    setIsFormValid(true);
  };

  const handleTextInputName = (name) => {
    let isValid = true;
    if (name === undefined || name.trim() === '') {
      isValid = true;
      setNameValidated({ fieldState: 'default', message: '' });
    }
    if (isValid) {
      if (nameValidated.fieldState === 'error') {
        setNameValidated({ fieldState: 'default', message: '' });
      }
    } else {
      setNameValidated({ fieldState: 'error', message: t('create_instance_name_invalid_helper_text') });
    }

    setIsFormValid(true);
    setTextInputNameValue(name);
    setServiceAccountFormData({ ...serviceAccountFormData, name: name || '' });
  };

  const handleServerError = (error: any) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
  };

  const handleTextInputDescription = (value) => {
    setTextInputDescriptionValue(value);
    setServiceAccountFormData({ ...serviceAccountFormData, description: value });
  };

  const validateCreateForm = () => {
    let isValid = true;
    const { name } = serviceAccountFormData;
    if (!name || name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    }
    return isValid;
  };

  const createServiceAccount = async () => {
    let isValid = validateCreateForm();
    const accessToken = await authContext?.getToken();

    if (!isValid) {
      setIsFormValid(false);
    } else {
      if (isValidToken(accessToken)) {
        try {
          const apisService = new DefaultApi({
            accessToken,
            basePath,
          });
          setCreationInProgress(true);
          await apisService.createServiceAccount(serviceAccountFormData).then((response) => {
            if (response.status >= 200) {
              resetForm();
              setIsOpen(false);
              fetchServiceAccounts();
            }
          });
        } catch (error) {
          handleServerError(error);
        }
      }
      setCreationInProgress(false);
    }
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

    return (
      <Form onSubmit={onFormSubmit}>
        {!isFormValid && (
          <FormAlert>
            <Alert variant="danger" title={t('common.create_instance_invalid_alert')} aria-live="polite" isInline />
          </FormAlert>
        )}
        <FormGroup
          label="Name"
          isRequired
          fieldId="text-input-name"
          helperTextInvalid={message}
          helperTextInvalidIcon={message && <ExclamationCircleIcon />}
          validated={fieldState}
        >
          <TextInput
            isRequired
            type="text"
            id="text-input-name"
            name="text-input-name"
            value={textInputNameValue}
            onChange={handleTextInputName}
            validated={fieldState}
          />
        </FormGroup>
        <FormGroup label="Description" fieldId="text-input-description">
          <TextInput
            isRequired
            type="text"
            id="text-input-description"
            name="text-input-description"
            aria-label="Input description"
            value={textInputDescriptionValue}
            onChange={handleTextInputDescription}
          />
        </FormGroup>
      </Form>
    );
  };

  return (
    <MASCreateModal
      isModalOpen={isOpen}
      title={t('create_a_service_account')}
      handleModalToggle={handleCreateModal}
      onCreate={createServiceAccount}
      isFormValid={isFormValid}
      primaryButtonTitle="Create"
      isCreationInProgress={isCreationInProgress}
    >
      {createForm()}
    </MASCreateModal>
  );
};

export { CreateServiceAccountModal };
