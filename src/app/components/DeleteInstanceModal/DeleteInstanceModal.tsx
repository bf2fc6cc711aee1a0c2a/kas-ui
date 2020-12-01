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
  confirmActionLabel = 'Confirm',
  cancelActionLabel = 'Cancel',
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
      aria-label="Delete instance modal"
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
          {confirmActionLabel}
        </Button>,
        <Button key="cancel" variant="link" onClick={handleModalToggle}>
          {cancelActionLabel}
        </Button>,
      ]}
    >
      <div dangerouslySetInnerHTML={{__html:description || ''}} />   
      {instanceStatus === InstanceStatus.COMPLETED && (
        <>
          <TextContent className="text-content">
            <Text>
              Please type <b>{selectedInstanceName}</b> to confirm.
            </Text>
          </TextContent>
          <TextInput id="instance-name" type="text" value={instanceNameInput} onChange={handleInstanceName} />
        </>
      )}
    </Modal>
  );
};

export { DeleteInstanceModal };
