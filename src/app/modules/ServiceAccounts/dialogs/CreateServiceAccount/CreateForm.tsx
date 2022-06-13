import {
  createEmptyNewServiceAccountRequest,
  isServiceAccountRequestInvalid,
  NewServiceAccountRequest,
} from "@app/models";
import { SetStateAction, Dispatch, FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MAX_INSTANCE_NAME_LENGTH,
  MAX_SERVICE_ACCOUNT_NAME_LENGTH,
} from "@app/utils";
import {
  Alert,
  Form,
  FormAlert,
  FormGroup,
  TextInput,
  Popover,
  FormProps,
} from "@patternfly/react-core";
import HelpIcon from "@patternfly/react-icons/dist/esm/icons/help-icon";

export type CreateFormProps = {
  createServiceAccount: () => Promise<void>;
  serviceAccountRequest: NewServiceAccountRequest;
  setServiceAccountRequest: Dispatch<SetStateAction<NewServiceAccountRequest>>;
  id: string;
};

export const CreateForm: FunctionComponent<CreateFormProps> = ({
  serviceAccountRequest,
  createServiceAccount,
  setServiceAccountRequest,
  id,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateName = (serviceAccountRequest: NewServiceAccountRequest) => {
    //validate required field
    if (
      serviceAccountRequest.name.value === undefined ||
      serviceAccountRequest.name.value.trim() === ""
    ) {
      serviceAccountRequest.name.validated = "error";
      serviceAccountRequest.name.errorMessage = t(
        "common.this_is_a_required_field"
      );
    } else if (
      serviceAccountRequest.name.value !== undefined &&
      !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(
        serviceAccountRequest.name.value.trim()
      )
    ) {
      serviceAccountRequest.name.validated = "error";
      serviceAccountRequest.name.errorMessage = t(
        "common.input_filed_invalid_helper_text"
      );
    }
    //validate max length
    else if (
      serviceAccountRequest.name.value !== undefined &&
      serviceAccountRequest.name.value.length > MAX_SERVICE_ACCOUNT_NAME_LENGTH
    ) {
      serviceAccountRequest.name.validated = "error";
      serviceAccountRequest.name.errorMessage = t(
        "serviceAccount.service_account_name_length_is_greater_than_expected",
        {
          maxLength: MAX_INSTANCE_NAME_LENGTH,
        }
      );
    } else {
      serviceAccountRequest.name.validated = "success";
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

  const FormValidAlert: FunctionComponent = () => {
    if (
      formSubmitted &&
      isServiceAccountRequestInvalid(serviceAccountRequest)
    ) {
      return (
        <FormAlert>
          <Alert
            variant="danger"
            title={t("common.form_invalid_alert")}
            aria-live="polite"
            isInline
          />
        </FormAlert>
      );
    }
    return <></>;
  };

  const submit: FormProps["onSubmit"] = (event) => {
    event.preventDefault();
    setFormSubmitted(true);
    const validated = validateName(serviceAccountRequest);
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
        label={t("serviceAccount.short_description")}
        isRequired
        fieldId="text-input-short-description"
        helperTextInvalid={serviceAccountRequest.name.errorMessage}
        validated={serviceAccountRequest.name.validated}
        helperText={t("common.input_filed_invalid_helper_text")}
        labelIcon={
          <Popover
            headerContent={
              <div>{t("serviceAccount.short_description_popover_title")}</div>
            }
            bodyContent={
              <div>{t("serviceAccount.short_description_popover_body")}</div>
            }
          >
            <button
              aria-label={t("serviceAccount.short_description_popover_button")}
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
      >
        <TextInput
          isRequired
          type="text"
          id="text-input-short-description"
          name="text-input-short-description"
          value={serviceAccountRequest.name.value}
          onChange={setName}
          validated={serviceAccountRequest.name.validated}
          autoFocus={true}
          ouiaId={"text-input"}
        />
      </FormGroup>
    </Form>
  );
};
