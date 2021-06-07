import React from 'react';
import {
  Modal,
  Button,
  ButtonVariant,
  ModalVariant,
  ModalProps,
  Text,
  ButtonProps,
  TextProps,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { getModalAppendTo } from '@app/utils/utils';
import './MASDeleteModal.css';

export type MASDeleteModalProps = {
  isModalOpen: boolean;
  title: string;
  modalProps?: Omit<ModalProps, 'children' | 'ref'>;
  handleModalToggle: () => void;
  children?: React.ReactNode;
  selectedItemData?: any;
  confirmButtonProps?: Omit<ButtonProps, 'children' | 'onClick'> & {
    id?: string;
    key?: string;
    label?: string;
    onClick?: (data?: any) => Promise<void> | void;
    'data-testid'?: string;
  };
  cancelButtonProps?: Omit<ButtonProps, 'children'> & {
    id?: string;
    key?: string;
    label?: string;
  };
  textProps?: Omit<TextProps, 'children'> & {
    description?: string;
  };
  textInputProps?: TextInputProps & {
    showTextInput: boolean;
    label: string;
    value: string | undefined;
  };
};

export const MASDeleteModal: React.FC<MASDeleteModalProps> = ({
  isModalOpen,
  title,
  modalProps,
  confirmButtonProps,
  cancelButtonProps,
  handleModalToggle,
  textProps,
  children,
  selectedItemData = '',
  textInputProps,
}: MASDeleteModalProps) => {
  const {
    variant = ModalVariant.small,
    titleIconVariant = 'warning',
    ['aria-label']: ariaLabel,
    showClose = true,
    ...restModalProps
  } = modalProps || {};

  const {
    id = 'mas--confirm__button',
    key = 'confirm-button',
    variant: buttonConfirmVariant = ButtonVariant.danger,
    onClick: onClickConfirmButton,
    isDisabled: isDisabledConfirmButton,
    label: confirmActionLabel = 'Delete',
    isLoading,
    ...restConfirmButtonProps
  } = confirmButtonProps || {};

  const {
    id: cancelButtonId = 'mas--cancel__button',
    key: cancelButtonKey = '"cancel-button',
    variant: cancelButtonVariant = ButtonVariant.link,
    label: cancelActionLabel = 'Cancel',
    ...restCancelButtonProps
  } = cancelButtonProps || {};

  const { className = 'mas--delete-item__modal--text', description, ...restTextProps } = textProps || {};
  const { label = '', value, onChange, onKeyPress, showTextInput, ...restInputFieldProps } = textInputProps || {};

  return (
    <Modal
      variant={variant}
      isOpen={isModalOpen}
      aria-label={ariaLabel}
      title={title}
      titleIconVariant={titleIconVariant}
      showClose={showClose}
      onClose={handleModalToggle}
      appendTo={getModalAppendTo}
      actions={[
        <Button
          id={id}
          key={key}
          variant={buttonConfirmVariant}
          onClick={() => onClickConfirmButton && onClickConfirmButton(selectedItemData)}
          isDisabled={isDisabledConfirmButton}
          isLoading={isLoading}
          {...restConfirmButtonProps}
        >
          {confirmActionLabel}
        </Button>,
        <Button
          id={cancelButtonId}
          key={cancelButtonKey}
          variant={cancelButtonVariant}
          onClick={handleModalToggle}
          {...restCancelButtonProps}
        >
          {cancelActionLabel}
        </Button>,
      ]}
      {...restModalProps}
    >
      {description && (
        <Text className={className} dangerouslySetInnerHTML={{ __html: description || '' }} {...restTextProps} />
      )}
      {showTextInput && (
        <>
          <label htmlFor="mas-name-input" dangerouslySetInnerHTML={{ __html: label }} />
          <TextInput
            id="mas--name__input"
            name="mas-name-input"
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            autoFocus={true}
            {...restInputFieldProps}
          />
        </>
      )}
      {children}
    </Modal>
  );
};
