import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertVariant } from "@patternfly/react-core";
import { DeleteModal } from "@app/common";
import { isServiceApiError } from "@app/utils";
import {
  Configuration,
  SecurityApi,
  ServiceAccountListItem,
} from "@rhoas/kafka-management-sdk";
import {
  BaseModalProps,
  DeleteServiceAccountProps,
  useAlert,
  useAuth,
  useConfig,
} from "@rhoas/app-services-ui-shared";

const DeleteServiceAccount: FunctionComponent<
  DeleteServiceAccountProps & BaseModalProps
> = ({ onDelete, serviceAccount, title, hideModal }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig() || { kas: {} };
  const { addAlert } = useAlert() || {};

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleModalToggle = () => {
    hideModal();
  };

  const deleteServiceAccount = async (
    serviceAccount: ServiceAccountListItem | undefined
  ) => {
    const serviceAccountId = serviceAccount?.id;
    if (serviceAccountId === undefined) {
      throw new Error("service account id not defined");
    }
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      const apisService = new SecurityApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );
      setIsLoading(true);

      try {
        await apisService
          .deleteServiceAccountById(serviceAccountId)
          .then(() => {
            handleModalToggle();
            setIsLoading(false);
            addAlert &&
              addAlert({
                title: t(
                  "serviceAccount.service_account_successfully_deleted",
                  {
                    name: serviceAccount?.name,
                  }
                ),
                variant: AlertVariant.success,
              });
            onDelete && onDelete();
          });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }

        handleModalToggle();
        setIsLoading(false);
        addAlert &&
          addAlert({
            title: t("common.something_went_wrong"),
            variant: AlertVariant.danger,
            description: reason,
          });
      }
    }
  };

  return (
    <DeleteModal
      isModalOpen={true}
      handleModalToggle={handleModalToggle}
      title={title}
      confirmButtonProps={{
        onClick: () =>
          deleteServiceAccount(serviceAccount as ServiceAccountListItem),
        label: "Delete",
        isLoading,
      }}
    >
      <p>
        <b>{serviceAccount?.name}</b> {t("serviceAccount.will_be_deleted")}
      </p>
    </DeleteModal>
  );
};

export { DeleteServiceAccount };
export default DeleteServiceAccount;
