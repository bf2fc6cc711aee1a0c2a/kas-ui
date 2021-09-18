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
  isFormValid: boolean;
  isCreationInProgress: boolean;
  primaryButtonTitle: string;
  dataTestIdSubmit?: string;
  dataTestIdCancel?: string;
  isDisabledButton?: boolean;
  formId: string;
};

export const MASCreateModal: React.FunctionComponent<MASCreateModalProps> = ({
  isModalOpen,
  children,
  title,
  handleModalToggle,
  isFormValid,
  isCreationInProgress,
  primaryButtonTitle,
  dataTestIdSubmit,
  dataTestIdCancel,
  id = 'modalCreateKafka',
  isDisabledButton,
  formId,
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
          key='submit'
          variant='primary'
          type='submit'
          form={formId}
          isDisabled={!isFormValid || isCreationInProgress || isDisabledButton}
          spinnerAriaValueText={t('submitting_request')}
          isLoading={isCreationInProgress}
          data-testid={dataTestIdSubmit}
        >
          {primaryButtonTitle}
        </Button>,
        <Button
          key='cancel'
          variant='link'
          onClick={handleModalToggle}
          data-testid={dataTestIdCancel}
        >
          {t('cancel')}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};
