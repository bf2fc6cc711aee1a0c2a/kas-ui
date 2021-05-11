import React from 'react';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { getModalAppendTo } from '@app/utils/utils';

export type MASCreateModalProps = {
  id?: string;
  isModalOpen: boolean;
  children?: React.ReactNode;
  title: string;
  handleModalToggle: () => void;
  onCreate: () => void;
  isFormValid: boolean;
  isCreationInProgress: boolean;
  primaryButtonTitle: string;
  dataTestIdSubmit?: string;
  dataTestIdCancel?: string;
};

export const MASCreateModal: React.FunctionComponent<MASCreateModalProps> = ({
  isModalOpen,
  children,
  title,
  handleModalToggle,
  onCreate,
  isFormValid,
  isCreationInProgress,
  primaryButtonTitle,
  dataTestIdSubmit,
  dataTestIdCancel,
  id = 'modalCreateKafka',
}: MASCreateModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      id={id}
      variant={ModalVariant.medium}
      title={title}
      isOpen={isModalOpen}
      onClose={handleModalToggle}
      appendTo={getModalAppendTo}
      actions={[
        <Button
          key="create"
          variant="primary"
          type="submit"
          onClick={onCreate}
          isDisabled={!isFormValid || isCreationInProgress}
          spinnerAriaValueText={t('submitting_request')}
          isLoading={isCreationInProgress}
          data-testid={dataTestIdSubmit}
        >
          {primaryButtonTitle}
        </Button>,
        <Button key="cancel" variant="link" onClick={handleModalToggle} data-testid={dataTestIdCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};
