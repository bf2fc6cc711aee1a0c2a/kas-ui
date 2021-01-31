import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@patternfly/react-core';
import { DeleteModal, DeleteModalProps } from '@app/components';
import { InstanceStatus } from '@app/utils';

export type DeleteInstanceModalContainerProps = DeleteModalProps & {
  instanceStatus?: string;
};

export const DeleteInstanceModalContainer: React.FC<DeleteInstanceModalContainerProps> = ({
  isModalOpen,
  modalProps,
  confirmButtonProps,
  cancelButtonProps,
  handleModalToggle,
  textProps,
  instanceStatus,
  selectedItemData,
}: DeleteInstanceModalContainerProps) => {
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

  return (
    <DeleteModal
      isModalOpen={isModalOpen}
      modalProps={modalProps}
      confirmButtonProps={{
        isDisabled: isConfirmButtonDisabled(),
        ...confirmButtonProps,
      }}
      cancelButtonProps={cancelButtonProps}
      handleModalToggle={handleModalToggle}
      textProps={textProps}
    >
      {instanceStatus === InstanceStatus.READY && (
        <>
          <label
            htmlFor="instance-name-input"
            dangerouslySetInnerHTML={{ __html: t('instance_name_label', { name: selectedInstanceName }) }}
          />
          <TextInput
            id="mk--instance-name__input"
            name="instance-name-input"
            type="text"
            value={instanceNameInput}
            onChange={handleInstanceName}
            autoFocus={true}
          />
        </>
      )}
    </DeleteModal>
  );
};
