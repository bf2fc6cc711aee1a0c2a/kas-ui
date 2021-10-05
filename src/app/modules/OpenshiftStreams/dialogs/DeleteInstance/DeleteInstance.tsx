import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DeleteModal } from "@app/common";
import { InstanceStatus } from "@app/utils";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";

export type DeleteInstanceModalProps = {
  kafka: KafkaRequest;
  onClose?: () => void;
  hideModal: () => void;
  onDelete: () => void;
  isLoading: boolean;
  setIsOpenDeleteInstanceModal?: (isopen: boolean) => void;
};

export const DeleteInstanceModal: React.FunctionComponent<DeleteInstanceModalProps> =
  ({
    kafka,
    onClose,
    hideModal,
    onDelete,
    isLoading,
    setIsOpenDeleteInstanceModal,
  }) => {
    const { t } = useTranslation();
    const selectedInstanceName = kafka?.name;

    const [instanceNameInput, setInstanceNameInput] = useState<string>();

    const handleInstanceName = (value: string) => {
      setInstanceNameInput(value);
    };

    const isConfirmButtonDisabled = () => {
      if (kafka.status === InstanceStatus.READY) {
        if (
          instanceNameInput?.toLowerCase() ===
          selectedInstanceName?.toLowerCase()
        ) {
          return false;
        }
        return true;
      }
      return false;
    };

    const onKeyPress = (event) => {
      if (event.key === "Enter" && !isConfirmButtonDisabled()) {
        submit();
      }
    };

    const submit = () => {
      onDelete && onDelete();
    };

    const handleToggle = () => {
      setInstanceNameInput("");
      hideModal();
      onClose && onClose();
    };

    if (kafka.status === InstanceStatus.READY) {
      return (
        <DeleteModal
          isModalOpen={true}
          title={`${t("delete_instance")}?`}
          confirmButtonProps={{
            isDisabled: isConfirmButtonDisabled(),
            "data-testid": "modalDeleteKafka-buttonDelete",
            label: t("delete"),
            onClick: submit,
            isLoading,
          }}
          handleModalToggle={handleToggle}
          textProps={{
            description: t("delete_instance_status_complete", {
              instanceName: kafka.name,
            }),
          }}
          selectedItemData={kafka}
          textInputProps={{
            showTextInput: kafka.status === InstanceStatus.READY,
            label: t("instance_name_label", { name: selectedInstanceName }),
            value: instanceNameInput,
            onChange: handleInstanceName,
            onKeyPress,
            autoFocus: true,
          }}
        />
      );
    } else if (
      kafka.status === InstanceStatus.ACCEPTED ||
      kafka.status === InstanceStatus.PROVISIONING ||
      kafka.status === InstanceStatus.PREPARING
    ) {
      return (
        <DeleteModal
          isModalOpen={true}
          title={`${t("delete_instance")}?`}
          confirmButtonProps={{
            isDisabled: isConfirmButtonDisabled(),
            "data-testid": "modalDeleteKafka-buttonDelete",
            label: t("delete"),
            onClick: submit,
            isLoading,
          }}
          handleModalToggle={handleToggle}
          textProps={{
            description: t("delete_instance_status_accepted_or_provisioning", {
              instanceName: kafka.name,
            }),
          }}
          selectedItemData={kafka}
          textInputProps={{
            showTextInput: false,
            label: t("instance_name_label", { name: selectedInstanceName }),
            value: instanceNameInput,
            onChange: handleInstanceName,
            onKeyPress,
            autoFocus: true,
          }}
        />
      );
    } else {
      return (
        <DeleteModal
          isModalOpen={true}
          title=""
          confirmButtonProps={{
            isDisabled: isConfirmButtonDisabled(),
            "data-testid": "modalDeleteKafka-buttonDelete",
            label: t("delete"),
            onClick: submit,
            isLoading,
          }}
          handleModalToggle={handleToggle}
          selectedItemData={kafka}
          textInputProps={{
            showTextInput: kafka.status === InstanceStatus.READY,
            label: t("instance_name_label", { name: selectedInstanceName }),
            value: instanceNameInput,
            onChange: handleInstanceName,
            onKeyPress,
            autoFocus: true,
          }}
        />
      );
    }
  };

export default DeleteInstanceModal;
