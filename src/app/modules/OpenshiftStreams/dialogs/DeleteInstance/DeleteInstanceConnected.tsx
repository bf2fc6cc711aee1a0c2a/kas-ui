import { useKms } from "@app/api";
import { isServiceApiError } from "@app/utils";
import { AlertVariant } from "@patternfly/react-core";
import {
  BaseModalProps,
  DeleteInstanceProps,
  useAlert,
} from "@rhoas/app-services-ui-shared";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DeleteInstanceModal,
  DeleteInstanceModalProps,
} from "./DeleteInstance";

const DeleteInstanceConnected: FunctionComponent<
  DeleteInstanceProps & BaseModalProps
> = ({ kafka, onDelete, hideModal }) => {
  const { addAlert } = useAlert() || {};
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const getApi = useKms();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const closeModal = () => {
    hideModal();
  };

  const deleteInstance = async () => {
    if (kafka.id) {
      try {
        setIsLoading(true);
        const apisService = getApi();
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
