import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@patternfly/react-core';
import { MASDeleteModal, MASDeleteModalProps } from '@app/common';
import { InstanceStatus } from '@app/utils';

export type DeleteInstanceModalProps = MASDeleteModalProps & {
  instanceStatus?: string;
};

export const DeleteInstanceModal: React.FC<DeleteInstanceModalProps> = ({
  isModalOpen,
  modalProps,
  confirmButtonProps,
  cancelButtonProps,
  handleModalToggle,
  textProps,
  instanceStatus,
  selectedItemData,
}: DeleteInstanceModalProps) => {
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
  return (
    <MASDeleteModal
      isModalOpen={isModalOpen}
      modalProps={modalProps}
      confirmButtonProps={{
        isDisabled: isConfirmButtonDisabled(),
        'data-testid': 'modalDeleteKafka-buttonDelete',
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
            onKeyPress={onKeyPress}
            autoFocus={true}
          />
        </>
      )}
    </MASDeleteModal>
  );
};
