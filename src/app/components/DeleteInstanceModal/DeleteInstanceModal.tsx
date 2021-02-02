import React, { useState } from 'react';
import { Modal, Button, ButtonVariant, ModalVariant, ModalProps, TextInput, Text } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/utils';
import './DeleteInstanceModal.css';
import { KafkaRequest } from 'src/openapi';
import { useStoreContext, types } from '@app/context-state-reducer';

export interface DeleteInstanceModalProps extends Omit<ModalProps, 'children'> {
  confirmActionLabel?: string;
  cancelActionLabel?: string;
  description?: string;
  selectedInstance: KafkaRequest;
  instanceStatus: string | undefined;
  onConfirm: (instance: KafkaRequest) => Promise<void>;
}

const DeleteInstanceModal = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useStoreContext();
  const { modalProps } = state && state.modal;
  const {
    confirmActionLabel,
    cancelActionLabel,
    title,
    onConfirm,
    description,
    variant = ModalVariant.small,
    titleIconVariant = 'warning',
    instanceStatus,
    selectedInstance,
  } = modalProps;
  const [instanceNameInput, setInstanceNameInput] = useState<string>();

  const selectedInstanceName: string = selectedInstance?.name || '';

  const handleModalToggle = () => {
    dispatch({ type: types.HIDE_MODAL });
  };

  const handleInstanceName = (value: string) => {
    setInstanceNameInput(value);
  };

  const isConfirmButtonDisabled = () => {
    if (instanceStatus === InstanceStatus.READY) {
      if (instanceNameInput?.toLowerCase() === selectedInstanceName.toLowerCase()) {
        return false;
      }
      return true;
    }
    return false;
  };

  const onConfirmDelete = () => {
    dispatch({type:types.HIDE_MODAL})
    onConfirm(selectedInstance);
  };

  return (
    <Modal
      variant={variant}
      isOpen={true}
      aria-label={t('delete_instance_modal')}
      title={title}
      titleIconVariant={titleIconVariant}
      showClose={true}
      onClose={handleModalToggle}
      actions={[
        <Button
          key="confirm-button"
          id="mk--confirm__button"
          variant={ButtonVariant.danger}
          onClick={onConfirmDelete}
          isDisabled={isConfirmButtonDisabled()}
        >
          {confirmActionLabel || t('delete_instance')}
        </Button>,
        <Button key="cancel" variant="link" id="mk--cancel__button" onClick={handleModalToggle}>
          {cancelActionLabel || t('cancel')}
        </Button>,
      ]}
    >
      <Text className="mk--delete-instance__modal--text" dangerouslySetInnerHTML={{ __html: description || '' }} />
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
    </Modal>
  );
};

export { DeleteInstanceModal };
