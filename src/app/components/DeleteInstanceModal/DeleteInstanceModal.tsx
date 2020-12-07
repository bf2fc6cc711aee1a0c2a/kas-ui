import React, { FunctionComponent, useState } from 'react';
import {
  Modal,
  Button,
  ButtonVariant,
  ModalVariant,
  ModalProps,
  TextInput,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/constants';
import './DeleteInstanceModal.css';
import { KafkaRequest } from 'src/openapi';

interface DeleteInstanceModalProps extends Omit<ModalProps, 'children'> {
  confirmActionLabel?: string;
  cancelActionLabel?: string;
  description?: string;
  selectedInstance: KafkaRequest;
  isModalOpen: boolean;
  instanceStatus: string | undefined;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onConfirm: (instance: KafkaRequest) => Promise<void>;
}

const DeleteInstanceModal: FunctionComponent<DeleteInstanceModalProps> = ({
  confirmActionLabel,
  cancelActionLabel,
  title,
  onConfirm,
  isModalOpen,
  setIsModalOpen,
  description,
  variant = ModalVariant.small,
  titleIconVariant = 'warning',
  instanceStatus,
  selectedInstance,
}: DeleteInstanceModalProps) => {
  const {t}=useTranslation();
  const [instanceNameInput, setInstanceNameInput] = useState<string>();
  
  const selectedInstanceName = selectedInstance?.name;

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInstanceName = (value: string) => {
    setInstanceNameInput(value);
  };

  const isConfirmButtonDisabled = () => {
    if (instanceStatus === InstanceStatus.COMPLETED) {
      if (instanceNameInput?.toLocaleLowerCase() === selectedInstanceName?.toLowerCase()) {
        return false;
      }
      return true;
    }
    return false;
  };
  const onConfirmDelete = () => {
    onConfirm(selectedInstance);
  };
  return (
    <Modal
      id="dialog-prompt-modal"
      variant={variant}
      isOpen={isModalOpen}
      aria-label={t('delete_instance_modal')}
      title={title}
      titleIconVariant={titleIconVariant}
      showClose={true}
      onClose={handleModalToggle}
      actions={[
        <Button
          key={'confirm-button'}
          variant={ButtonVariant.danger}
          onClick={onConfirmDelete}
          isDisabled={isConfirmButtonDisabled()}
        >
          {confirmActionLabel || t('delete_instance')}
        </Button>,
        <Button key="cancel" variant="link" onClick={handleModalToggle}>
          {cancelActionLabel || t('cancel')}
        </Button>,
      ]}
    >
      <Text dangerouslySetInnerHTML={{__html:description || ''}} />   
      {instanceStatus === InstanceStatus.COMPLETED && (
        <>
          <TextContent className="text-content">
            <Text dangerouslySetInnerHTML={{__html:t("instance_name_label",{name:selectedInstanceName})}}/>          
          </TextContent>
          <TextInput id="instance-name" type="text" value={instanceNameInput} onChange={handleInstanceName} />
        </>
      )}
    </Modal>
  );
};

export { DeleteInstanceModal };
