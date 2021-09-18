import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CancelButtonProps,
  ConfirmButtonProps,
  DeleteModal,
  NestedTextProps,
  useRootModalContext,
} from '@app/common';
import { InstanceStatus } from '@app/utils';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export const DeleteInstance: React.FunctionComponent = () => {
  const { store, hideModal } = useRootModalContext();
  const props = { ...store?.modalProps, hideModal };

  return <DeleteInstanceModal {...props} />;
};

export type DeleteInstanceModalProps = {
  title: string;
  confirmButtonProps: ConfirmButtonProps<KafkaRequest>;
  cancelButtonProps: CancelButtonProps;
  textProps: NestedTextProps;
  instanceStatus: InstanceStatus;
  selectedItemData: KafkaRequest;
  onClose?: () => void;
  hideModal: () => void;
};

export const DeleteInstanceModal: React.FunctionComponent<DeleteInstanceModalProps> =
  ({
    title,
    confirmButtonProps,
    cancelButtonProps,
    textProps,
    instanceStatus,
    selectedItemData,
    onClose,
    hideModal,
  }) => {
    const { t } = useTranslation();
    const selectedInstanceName = selectedItemData?.name;

    const [instanceNameInput, setInstanceNameInput] = useState<string>();

    const handleInstanceName = (value: string) => {
      setInstanceNameInput(value);
    };

    const isConfirmButtonDisabled = () => {
      if (instanceStatus === InstanceStatus.READY) {
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
      if (event.key === 'Enter' && !isConfirmButtonDisabled()) {
        confirmButtonProps?.onClick &&
          confirmButtonProps.onClick(selectedItemData);
      }
    };

    const handleToggle = () => {
      setInstanceNameInput('');
      hideModal();
      onClose && onClose();
    };

    return (
      <DeleteModal
        isModalOpen={true}
        title={title}
        confirmButtonProps={{
          isDisabled: isConfirmButtonDisabled(),
          'data-testid': 'modalDeleteKafka-buttonDelete',
          ...confirmButtonProps,
        }}
        cancelButtonProps={cancelButtonProps}
        handleModalToggle={handleToggle}
        textProps={textProps}
        selectedItemData={selectedItemData}
        textInputProps={{
          showTextInput: instanceStatus === InstanceStatus.READY,
          label: t('instance_name_label', { name: selectedInstanceName }),
          value: instanceNameInput,
          onChange: handleInstanceName,
          onKeyPress,
          autoFocus: true,
        }}
      />
    );
  };

export default DeleteInstance;
