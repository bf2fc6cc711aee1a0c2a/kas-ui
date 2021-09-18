import {
  createEmptyNewServiceAccountRequest,
  isServiceAccountRequestInvalid,
  NewServiceAccountRequest,
} from '@app/models';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MAX_INSTANCE_NAME_LENGTH,
  MAX_SERVICE_ACCOUNT_DESC_LENGTH,
  MAX_SERVICE_ACCOUNT_NAME_LENGTH,
} from '@app/utils';
import {
  Alert,
  Form,
  FormAlert,
  FormGroup,
  TextArea,
  TextInput,
} from '@patternfly/react-core';

export type CreateFormProps = {
  createServiceAccount: () => Promise<void>;
  serviceAccountRequest: NewServiceAccountRequest;
  setServiceAccountRequest: React.Dispatch<
    React.SetStateAction<NewServiceAccountRequest>
  >;
  id: string;
};

export const CreateForm: React.FunctionComponent<CreateFormProps> = ({
  serviceAccountRequest,
  createServiceAccount,
  setServiceAccountRequest,
  id,
}) => {
  const { t } = useTranslation();
  const [formSubmitted, setFormSubmitted] = useState(false);

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
    if (
      formSubmitted &&
      isServiceAccountRequestInvalid(serviceAccountRequest)
    ) {
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
    }
    return <></>;
  };

  const submit = (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    const validated = validateName(validateDescription(serviceAccountRequest));
    setServiceAccountRequest({ ...validated });

    if (!isServiceAccountRequestInvalid(validated)) {
      createServiceAccount().then(() => resetForm());
    }
  };

  const resetForm = () => {
    setServiceAccountRequest(createEmptyNewServiceAccountRequest());
  };

  return (
    <Form onSubmit={submit} id={id}>
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
