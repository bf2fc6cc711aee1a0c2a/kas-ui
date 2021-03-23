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
import { DefaultApi, ServiceAccount } from './../../../../openapi/api';
import { NewServiceAccount } from './../../../models/serviceAccountsModel';
import { isValidToken } from '@app/utils';
import { useTranslation } from 'react-i18next';

export type CreateInstanceModalProps = {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void;
}

const CreateServiceAccountModal: React.FunctionComponent<CreateInstanceModalProps> = ({isOpen, setIsOpen}: CreateInstanceModalProps) => {

  const newServiceAccount: NewServiceAccount = new NewServiceAccount();
  newServiceAccount.name = '';
  newServiceAccount.description = '';

  const [textInputNameValue, setTextInputNameValue] = useState('');
  const [textInputDescriptionValue, setTextInputDescriptionValue] = useState('');
  const [serviceAccountFormData, setServiceAccountFormData] = useState<NewServiceAccount>(newServiceAccount);
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const resetForm = () => {
    setServiceAccountFormData({ ...serviceAccountFormData, name: '', description: '' });
    setIsFormValid(true);
  }

  const handleTextInputName = value => {
    setIsFormValid(true);
    setTextInputNameValue(value);
    setServiceAccountFormData({ ...serviceAccountFormData, name: value });
  };

  const handleTextInputDescription = value => {
    setIsFormValid(true);
    setTextInputDescriptionValue(value);
    setServiceAccountFormData({ ...serviceAccountFormData, description: value });
  };

  const validateCreateForm = () => {
    let isValid = true;
    const { name, description } = serviceAccountFormData;
    if (!name || name.trim() === '') {
      isValid = false;
    }
    if (!description || description.trim() === '') {
      isValid = false;
    }
    return isValid;
  }

  const createServiceAccount = async () => {
    let isValid = validateCreateForm();
    const accessToken = await authContext?.getToken();

    if(!isValid) {
      setIsFormValid(false);
    }
    else {
      if (isValidToken(accessToken)) {
        try {
          const apisService = new DefaultApi({
            accessToken,
            basePath,
        });
        await apisService.createServiceAccount(serviceAccountFormData).then((response) => {
          if(response.status >= 200 ) {
            resetForm();
            setIsOpen(false);
          }
        });
        } catch (error) {
          // handleServerError(error);
          console.log(error);
        }
      }
    }
  }

  const handleCreateModal = () => {
    resetForm();
    setIsOpen(!isOpen);
  }

  const createForm = () => {
    return (
      <Form>
        <FormGroup
          label="Name"
          isRequired
          fieldId="form-group-name"
        >
          <TextInput
            isRequired
            type="text"
            id="text-input-name"
            name="text-input-name"
            aria-label="Input name"
            value={textInputNameValue}
            onChange={handleTextInputName}
          />
        </FormGroup>
        <FormGroup
          label="Description"
          fieldId="form-group-name"
        >
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
    )
  }
  
  return (
    <Modal
      id="create-service-account-modal"
      variant={ModalVariant.medium}
      title="Create a service account"
      description="Enter a name and description for your service account"
      isOpen={isOpen}
      onClose={() => handleCreateModal()}
      actions={[
        <Button
          key="create"
          variant="primary"
          type="submit"
          onClick={() => createServiceAccount()}
          isDisabled={isFormValid ? false : true}
          spinnerAriaValueText={t('common.submitting_request')}
          isLoading={false}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={() => handleCreateModal()}>
          Cancel
        </Button>
      ]}
    >
      {createForm()}
    </Modal>
  )
}

export { CreateServiceAccountModal };
