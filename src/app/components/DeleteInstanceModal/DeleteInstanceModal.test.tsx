import * as React from 'react';
import { DeleteInstanceModal, DeleteInstanceModalProps } from './DeleteInstanceModal';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from 'src/openapi';
import { InstanceStatus } from '@app/constants';
import { ModalVariant } from '@patternfly/react-core';

jest.mock('react-i18next', () => {
  const reactI18next = jest.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: jest.fn() } }),
  };
});

const selectedInstance: KafkaRequest = {
  name: 'test-instance',
};
const onConfirm = jest.fn();
const setIsModalOpen = jest.fn();
const props: DeleteInstanceModalProps = {
  confirmActionLabel: 'confirm',
  cancelActionLabel: 'cancel',
  title: 'test title',
  onConfirm: onConfirm,
  isModalOpen: true,
  setIsModalOpen: setIsModalOpen,
  description: `The ${selectedInstance.name} instance will be deleted.`,
  titleIconVariant: 'warning',
  instanceStatus: InstanceStatus.ACCEPTED,
  selectedInstance: selectedInstance,
};

describe('Delete Instance Modal', () => {
  test('should render modal with props text', () => {
    const { getByTestId, getByText } = render(<DeleteInstanceModal {...props} />);
    getByTestId('dialog-prompt-modal');
    props.title && getByText(props.title);
    props.confirmActionLabel && getByText(props.confirmActionLabel);
    props.cancelActionLabel && getByText(props.cancelActionLabel);
    props.description && getByText(props.description);
  });

  test('confirm and close actions should be handled', () => {
    const { getByTestId } = render(<DeleteInstanceModal {...props} />);

    userEvent.click(getByTestId('confirm-delete-button'));
    expect(onConfirm).toHaveBeenCalled();

    userEvent.click(getByTestId('cancel-delete-button'));
    expect(setIsModalOpen).toHaveBeenCalled();
  });

  test('should render input box for completed status', () => {
    props.instanceStatus = InstanceStatus.COMPLETED;

    const { getByTestId } = render(<DeleteInstanceModal {...props} />);

    getByTestId('label-completed-instance-name-description');
    getByTestId('instance-name-input');
  });

  test('confirm button should be disabled for empty or invalid input of instance with completed status', () => {
    props.instanceStatus = InstanceStatus.COMPLETED;
    const { getByTestId } = render(<DeleteInstanceModal {...props} />);

    const inputElement: any = getByTestId('instance-name-input');
    const confirmBtn: any = getByTestId('confirm-delete-button');

    expect(confirmBtn.disabled).toBeTruthy();
    userEvent.type(inputElement, selectedInstance?.name || 'test');

    //should match with exact input value
    expect(inputElement.value).toMatch(selectedInstance?.name || 'test');
    // confirm button get enabled if data matches.
    expect(confirmBtn.disabled).toBeFalsy();
  });

  test('should render large modal with success icon', () => {
    const props: DeleteInstanceModalProps = {
      confirmActionLabel: 'confirm',
      cancelActionLabel: 'cancel',
      title: 'test title',
      onConfirm: jest.fn(),
      isModalOpen: true,
      setIsModalOpen: jest.fn(),
      description: 'test description',
      variant: ModalVariant.large,
      titleIconVariant: 'success',
      instanceStatus: InstanceStatus.FAILED,
      selectedInstance: selectedInstance,
    };
    const { getByTestId } = render(<DeleteInstanceModal {...props} />);
    const classList: string[] = getByTestId('dialog-prompt-modal').className.split(' ');

    //check the modal variant is large
    expect(classList).toContain('pf-m-lg');
    // check the title icon variant is success
    expect(classList).toContain('pf-m-success');
  });

  test('should render small modal with warning icon', () => {
    const props: DeleteInstanceModalProps = {
      confirmActionLabel: 'confirm',
      cancelActionLabel: 'cancel',
      title: 'test title',
      onConfirm: jest.fn(),
      isModalOpen: true,
      setIsModalOpen: jest.fn(),
      description: 'test description',
      instanceStatus: InstanceStatus.FAILED,
      selectedInstance: selectedInstance,
    };
    const { getByTestId } = render(<DeleteInstanceModal {...props} />);
    const classList: string[] = getByTestId('dialog-prompt-modal').className.split(' ');

    //check the modal variant is small
    expect(classList).toContain('pf-m-sm');
    // check the title icon variant is warning
    expect(classList).toContain('pf-m-warning');
  });

  test('should render with name and description as undefined', () => {
    const props: DeleteInstanceModalProps = {
      confirmActionLabel: 'confirm',
      cancelActionLabel: 'cancel',
      title: 'test title',
      onConfirm: jest.fn(),
      isModalOpen: true,
      setIsModalOpen: jest.fn(),
      variant: ModalVariant.large,
      titleIconVariant: 'success',
      instanceStatus: InstanceStatus.FAILED,
      selectedInstance: { id: 'test-id', name: undefined },
    };
    const { getByTestId } = render(<DeleteInstanceModal {...props} />);

    getByTestId('dialog-prompt-modal');
  });

  test('should render with default label for cancel and delete instance modal', () => {
    const props: DeleteInstanceModalProps = {
      title: 'test title',
      onConfirm: jest.fn(),
      isModalOpen: true,
      setIsModalOpen: jest.fn(),
      variant: ModalVariant.large,
      titleIconVariant: 'success',
      instanceStatus: InstanceStatus.FAILED,
      selectedInstance: selectedInstance,
    };
    const { getByText } = render(<DeleteInstanceModal {...props} />);

    getByText('delete_instance');
    getByText('cancel');
  });
});
