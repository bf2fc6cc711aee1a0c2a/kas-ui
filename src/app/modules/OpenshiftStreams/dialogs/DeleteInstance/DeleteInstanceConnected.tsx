import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertVariant } from "@patternfly/react-core";
import {
  BaseModalProps,
  DeleteInstanceProps,
  useAlert,
  useAuth,
  useConfig,
} from "@rhoas/app-services-ui-shared";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";
import {
  DeleteInstanceModal,
  DeleteInstanceModalProps,
} from "./DeleteInstance";
import { isServiceApiError } from "@app/utils";

const DeleteInstanceConnected: React.FunctionComponent<
  DeleteInstanceProps & BaseModalProps
> = ({ kafka, onDelete, hideModal }) => {
  const { addAlert } = useAlert() || {};
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const closeModal = () => {
    hideModal();
  };

  const deleteInstance = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && kafka.id) {
      try {
        setIsLoading(true);
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.deleteKafkaById(kafka.id, true).then(() => {
          setIsLoading(false);
        });
        closeModal();
        onDelete && onDelete();
      } catch (error) {
        setIsLoading(false);
        handleServerError(error);
      }
    }
  };

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

  return (
    <DeleteInstanceModal
      hideModal={hideModal}
      onClose={closeModal}
      kafka={kafka as DeleteInstanceModalProps["kafka"]}
      onDelete={deleteInstance}
      isLoading={isLoading}
    />
  );
};

export { DeleteInstanceConnected };
export default DeleteInstanceConnected;
