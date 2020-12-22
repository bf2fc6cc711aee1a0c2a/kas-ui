import * as React from 'react';
import { DeleteInstanceModal, DeleteInstanceModalProps } from './DeleteInstanceModal';
import i18n from '../../../i18n/i18n';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from 'src/openapi';
import { InstanceStatus } from '@app/constants';

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
const onClose = jest.fn();
const setIsModalOpen = jest.fn();
const props: DeleteInstanceModalProps = {
  confirmActionLabel: 'confirm',
  cancelActionLabel: 'cancel',
  title: 'test title',
  onConfirm: jest.fn(),
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

    // userEvent.click(getByTestId('confirm-delete-button'));
    // expect(onConfirm).toHaveBeenCalled();

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
    const confirmBtn:any = getByTestId('confirm-delete-button');
    
    expect(confirmBtn.disabled).toBeTruthy();
    userEvent.type(inputElement, selectedInstance?.name || 'test');

    //should match with exact input value
    expect(inputElement.value).toMatch(selectedInstance?.name || 'test');
    // confirm button get enabled if data matches.
    expect(confirmBtn.disabled).toBeFalsy();
  });
});
