
import React from 'react';
import {
  Button,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

export type CreateInstanceModalProps = {
  isOpen: boolean,
  handleCreateModal: () => void
}

const CreateServiceAccountModal: React.FunctionComponent<CreateInstanceModalProps> = ({isOpen, handleCreateModal}: CreateInstanceModalProps) => {
  return (
    <Modal
      id="create-service-account-modal"
      variant={ModalVariant.medium}
      title="Create a service account"
      description="Enter a name and description for your service account"
      isOpen={isOpen}
      onClose={handleCreateModal}
      actions={[
        <Button
          key="create"
          variant="primary"
          type="submit"
          onClick={}
          isDisabled={}
          spinnerAriaValueText='submitting_request'
          isLoading={}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={handleCreateModal} data-testid="modalCreateKafka-buttonCancel">
          Cancel
        </Button>
      ]}
    >
      Form goes here..
    </Modal>
  )
}

export { CreateServiceAccountModal };
