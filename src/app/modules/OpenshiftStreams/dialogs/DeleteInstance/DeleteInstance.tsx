import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MASDeleteModal, useRootModalContext } from '@app/common';
import { InstanceStatus } from '@app/utils';

export const DeleteInstance: React.FunctionComponent = () => {
  const { store, hideModal } = useRootModalContext();
  const props = { ...store?.modalProps, hideModal };

  return <DeleteInstanceModal {...props} />;
};

export const DeleteInstanceModal = (props) => {
  const {
    title,
    confirmButtonProps,
    cancelButtonProps,
    textProps,
    instanceStatus,
    selectedItemData,
    onClose,
    hideModal,
  } = props || {};
  const { t } = useTranslation();
  const selectedInstanceName = selectedItemData?.name;

  const [instanceNameInput, setInstanceNameInput] = useState<string>();

  const handleInstanceName = (value: string) => {
    setInstanceNameInput(value);
  };

  const isConfirmButtonDisabled = () => {
    if (instanceStatus === InstanceStatus.READY) {
      if (instanceNameInput?.toLowerCase() === selectedInstanceName?.toLowerCase()) {
        return false;
      }
      return true;
    }
    return false;
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter' && !isConfirmButtonDisabled()) {
      confirmButtonProps?.onClick && confirmButtonProps.onClick(selectedItemData);
    }
  };

  const handleToggle = () => {
    setInstanceNameInput('');
    hideModal();
    onClose && onClose();
  };

  return (
    <MASDeleteModal
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
    ></MASDeleteModal>
  );
};

export default DeleteInstance;
