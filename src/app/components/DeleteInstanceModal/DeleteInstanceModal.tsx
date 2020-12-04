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
import  './DeleteInstanceModal.css';

interface DeleteInstanceModalProps extends Omit<ModalProps, 'children'> {
  confirmActionLabel?: string;
  cancelActionLabel?: string;
  description?: string;
  selectedInstanceName: string | undefined;
  isModalOpen: boolean;
  instanceStatus: string | undefined;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onConfirm: (event: any) => Promise<void>;
}

const DeleteInstanceModal: FunctionComponent<DeleteInstanceModalProps> = ({
  confirmActionLabel,
  cancelActionLabel,
  title,
  onConfirm,
  selectedInstanceName,
  isModalOpen,
  setIsModalOpen,
  description,
  variant = ModalVariant.small,
  titleIconVariant = 'warning',
  instanceStatus,
}: DeleteInstanceModalProps) => {
  const {t}=useTranslation();
  const [instanceNameInput, setInstanceNameInput] = useState<string>();

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
          onClick={onConfirm}
          isDisabled={isConfirmButtonDisabled()}
        >
          {confirmActionLabel || t('confirm')}
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
