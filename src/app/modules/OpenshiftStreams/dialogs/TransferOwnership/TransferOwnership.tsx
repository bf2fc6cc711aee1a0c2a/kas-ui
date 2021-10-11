import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  Select,
  SelectVariant,
  Modal,
  Button,
  SelectOption,
  SelectOptionObject,
  AlertVariant,
} from "@patternfly/react-core";
import {
  KafkaRequest,
  Configuration,
  DefaultApi,
  KafkaUpdateRequest,
} from "@rhoas/kafka-management-sdk";
import {
  Principal,
  usePrincipals,
  useAuth,
  useConfig,
  useAlert,
} from "@rhoas/app-services-ui-shared";
import { isServiceApiError } from "@app/utils/error";

export type TransferOwnershipProps = {
  kafka: KafkaRequest;
  refreshKafkas: () => void;
  onClose?: () => void;
  hideModal: () => void;
};

export const TransferOwnership: React.FC<TransferOwnershipProps> = ({
  kafka,
  onClose,
  hideModal,
  refreshKafkas,
}) => {
  const { t } = useTranslation();
  const { getAllUserAccounts } = usePrincipals() || {
    getAllUserAccounts: () => [],
  };
  const userAccounts = getAllUserAccounts();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert() || { addAlert: () => "" };

  //states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selection, SetSelection] = useState();
  const [loading, setLoading] = useState<boolean>();

  const onCloseModal = () => {
    hideModal();
    onClose && onClose();
  };

  const onToggle = (isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };

  const clearSelection = () => {
    SetSelection(undefined);
    setIsOpen(false);
  };

  const onSlect = (
    _,
    selection: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    }
    SetSelection(selection);
    setIsOpen(false);
  };

  const onSubmitTransferOwnership = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && selection?.trim() && kafka?.id) {
      setLoading(true);
      const kafkaUpdateRequest: KafkaUpdateRequest = { owner: selection };

      const apisService = new DefaultApi(
        new Configuration({
          accessToken,
          basePath,
        })
      );

      try {
        await apisService
          .updateKafkaById(kafka.id, kafkaUpdateRequest)
          .then((res) => {
            refreshKafkas && refreshKafkas();
            addAlert({
              title: t("owner_change_sucess_message"),
              variant: AlertVariant.success,
            });
            setLoading(false);
            onCloseModal();
          });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }

        addAlert({
          title: t("common.something_went_wrong"),
          variant: AlertVariant.danger,
          description: reason,
        });
        setLoading(false);
        onCloseModal();
      }
    }
  };

  return (
    <Modal
      id="manage-permissions-modal"
      title={t("change_owner")}
      isOpen={true}
      onClose={onCloseModal}
      variant="medium"
      position="top"
      actions={[
        <Button
          key="changeowner"
          variant="primary"
          onClick={onSubmitTransferOwnership}
          isLoading={loading}
          disabled={!selection?.trim()}
        >
          {t("common.change_owner")}
        </Button>,
        <Button key="cancel" variant="link" onClick={onCloseModal}>
          {t("cancel")}
        </Button>,
      ]}
    >
      <Form>
        <FormGroup fieldId="Current-owner-name" label={t("current_owner_name")}>
          {kafka?.owner}
        </FormGroup>
        <FormGroup fieldId="New-owner-name" label={t("new_owner_name")}>
          <Select
            variant={SelectVariant.typeahead}
            onToggle={onToggle}
            isOpen={isOpen}
            placeholderText={t("select_user_account")}
            createText={t("common.use")}
            menuAppendTo="parent"
            maxHeight={400}
            onSelect={onSlect}
            selections={selection}
            isCreatable
          >
            {userAccounts?.map((userAccount: Principal) => {
              const { id, displayName } = userAccount;
              return (
                <SelectOption key={id} value={id} description={displayName}>
                  {id}
                </SelectOption>
              );
            })}
          </Select>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default TransferOwnership;
