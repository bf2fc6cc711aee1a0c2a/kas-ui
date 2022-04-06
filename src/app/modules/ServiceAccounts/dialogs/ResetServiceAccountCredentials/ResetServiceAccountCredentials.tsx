import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertVariant, Button, Modal } from "@patternfly/react-core";
import { isServiceApiError } from "@app/utils";
import { getModalAppendTo } from "@app/utils/utils";
import {
  Configuration,
  SecurityApi,
  ServiceAccount,
} from "@rhoas/kafka-management-sdk";
import {
  BaseModalProps,
  ResetServiceAccountCredentialsProps,
  useAlert,
  useAuth,
  useConfig,
} from "@rhoas/app-services-ui-shared";
import Credentials from "@app/modules/ServiceAccounts/components/Credentials /Credentials";

enum Step {
  Confirm = "Confirm",
  Credentials = "Credentials",
}

const ResetServiceAccountCredentials: React.FunctionComponent<
  ResetServiceAccountCredentialsProps & BaseModalProps
> = ({ serviceAccount, onReset, variant, title, hideModal }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig() || { kas: {} };
  const { addAlert } = useAlert() || {};

  const [isModalLoading, setIsModalLoading] = useState(false);
  const [step, setStep] = useState<Step>(Step.Confirm);
  const [resetServiceAccount, setResetServiceAccount] = useState<
    ServiceAccount | undefined
  >();

  const handleServerError = (error: unknown) => {
    let reason: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
    }
    addAlert &&
      addAlert({
        title: t("something_went_wrong"),
        variant: AlertVariant.danger,
        description: reason,
      });
  };

  const resetServiceAccountCreds = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new SecurityApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        if (serviceAccount.id === undefined) {
          throw new Error("id must not be undefined");
        }
        setIsModalLoading(true);
        const response = await apisService.resetServiceAccountCreds(
          serviceAccount.id
        );
        onReset && onReset();
        setResetServiceAccount(response.data);
        setStep(Step.Credentials);
      } catch (error) {
        handleServerError(error);
        setIsModalLoading(false);
      }
    }
  };

  const handleModalToggle = () => {
    hideModal();
  };

  const StepConfirm: React.FunctionComponent = () => (
    <span
      dangerouslySetInnerHTML={{
        __html: t("serviceAccount.client_secret_will_be_reset", {
          serviceAccountId: serviceAccount.name,
          client_id: serviceAccount.client_id,
        }),
      }}
    />
  );

  const getModalActions = () => {
    if (step === Step.Confirm) {
      return [
        <Button
          key="create"
          variant="primary"
          type="submit"
          onClick={resetServiceAccountCreds}
          spinnerAriaValueText={t("common.submitting_request")}
          isLoading={isModalLoading}
        >
          {t("serviceAccount.reset")}
        </Button>,
        <Button key="cancel" variant="link" onClick={handleModalToggle}>
          {t("common.cancel")}
        </Button>,
      ];
    }
    return [];
  };

  const Body: React.FunctionComponent = () => {
    if (step === Step.Confirm) {
      return <StepConfirm />;
    }
    if (resetServiceAccount === undefined) {
      throw new Error("resetServiceAccount must not be undefined");
    }
    return (
      <Credentials serviceAccount={resetServiceAccount} close={hideModal} />
    );
  };

  return (
    <Modal
      id="reset-service-account-modal"
      variant={variant}
      title={step === Step.Confirm ? title : ""}
      isOpen={true}
      onClose={handleModalToggle}
      appendTo={getModalAppendTo}
      actions={getModalActions()}
      showClose={false}
    >
      <Body />
    </Modal>
  );
};

export { ResetServiceAccountCredentials };
export default ResetServiceAccountCredentials;
