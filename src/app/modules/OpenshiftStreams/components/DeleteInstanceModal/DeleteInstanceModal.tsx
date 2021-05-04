import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@patternfly/react-core';
import { MASDeleteModal, useRootModalContext } from '@app/common';
import { InstanceStatus } from '@app/utils';

export const DeleteInstanceModal: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { store, hideModal } = useRootModalContext();
  const { title, confirmButtonProps, cancelButtonProps, textProps, instanceStatus, selectedItemData } =
    store?.modalProps || {};
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
