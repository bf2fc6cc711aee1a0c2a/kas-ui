import { ReactNode, FunctionComponent, ReactElement } from "react";
import {
  Button,
  ButtonProps,
  ButtonVariant,
  Modal,
  ModalProps,
  ModalVariant,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
} from "@patternfly/react-core";
import { getModalAppendTo } from "@app/utils/utils";
import "./DeleteModal.css";

export type ConfirmButtonProps<T> = Omit<
  ButtonProps,
  "children" | "onClick"
> & {
  id?: string;
  key?: string;
  label?: string;
  onClick?: (data?: T) => Promise<void> | void;
  "data-testid"?: string;
};

export type NestedModalProps = Omit<ModalProps, "children" | "ref">;

export type CancelButtonProps = Omit<ButtonProps, "children"> & {
  id?: string;
  key?: string;
  label?: string;
};

export type NestedTextProps = Omit<TextProps, "children"> & {
  description?: string;
};

export type NestedTextInputProps = TextInputProps & {
  showTextInput: boolean;
  label: string;
  value: string | undefined;
};

export type DeleteModalProps<T> = {
  isModalOpen: boolean;
  title?: string;
  modalProps?: NestedModalProps;
  handleModalToggle: () => void;
  children?: ReactNode;
  selectedItemData?: T;
  confirmButtonProps?: ConfirmButtonProps<T>;
  cancelButtonProps?: CancelButtonProps;
  textProps?: NestedTextProps;
  textInputProps?: NestedTextInputProps;
};

export const DeleteModal = <T,>({
  isModalOpen,
  title,
  modalProps,
  confirmButtonProps,
  cancelButtonProps,
  handleModalToggle,
  textProps,
  children,
  selectedItemData,
  textInputProps,
}: DeleteModalProps<T>): ReactElement => {
  const {
    variant = ModalVariant.small,
    titleIconVariant = "warning",
    ["aria-label"]: ariaLabel,
    showClose = true,
    ...restModalProps
  } = modalProps || {};

  const {
    id = "confirm__button",
    key = "confirm-button",
    variant: buttonConfirmVariant = ButtonVariant.danger,
    onClick: onClickConfirmButton,
    isDisabled: isDisabledConfirmButton,
    label: confirmActionLabel = "Delete",
    isLoading,
    ...restConfirmButtonProps
  } = confirmButtonProps || {};

  const {
    id: cancelButtonId = "cancel__button",
    key: cancelButtonKey = '"cancel-button',
    variant: cancelButtonVariant = ButtonVariant.link,
    label: cancelActionLabel = "Cancel",
    ...restCancelButtonProps
  } = cancelButtonProps || {};

  const {
    className = "delete-item__modal--text",
    description,
    ...restTextProps
  } = textProps || {};
  const {
    label = "",
    value,
    onChange,
    onKeyPress,
    showTextInput,
    ...restInputFieldProps
  } = textInputProps || {};

  const ConfirmDelete: FunctionComponent = () => {
    if (showTextInput) {
      return (
        <>
          <label
            htmlFor="mas-name-input"
            dangerouslySetInnerHTML={{ __html: label }}
          />
          <TextInput
            id="name__input"
            name="mas-name-input"
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            autoFocus={true}
            {...restInputFieldProps}
          />
        </>
      );
    } else {
      return <></>;
    }
  };

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
          onClick={() =>
            onClickConfirmButton && onClickConfirmButton(selectedItemData)
          }
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
      <Text
        className={className}
        dangerouslySetInnerHTML={{ __html: description || "" }}
        {...restTextProps}
      />
      <ConfirmDelete />
      {children}
    </Modal>
  );
};
