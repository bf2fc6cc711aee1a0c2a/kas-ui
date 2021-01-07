import * as React from 'react';
import { DeleteInstanceModal, DeleteInstanceModalProps } from './DeleteInstanceModal';

import { render, act } from '@testing-library/react';
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
const setup = (props: DeleteInstanceModalProps) => {
  return render(<DeleteInstanceModal {...props} />);
};
describe('Delete Instance Modal', () => {
  it('should render modal with props text', () => {
    const { getByText } = setup(props);
    expect(getByText('test title')).toBeInTheDocument();
    expect(getByText('confirm')).toBeInTheDocument();
    expect(getByText('cancel')).toBeInTheDocument();
    expect(getByText(`The test-instance instance will be deleted.`)).toBeInTheDocument();
  });

  it('should handle confirm and close actions', () => {
    const { getByRole } = setup(props);

    act(() => {
      // test confirm click button
      userEvent.click(getByRole('button', { name: /confirm/i }));
    });

    expect(onConfirm).toHaveBeenCalled();
    expect(onConfirm).toBeCalledTimes(1);

    act(() => {
      // test cancel click button
      userEvent.click(getByRole('button', { name: /cancel/i }));
    });

    expect(setIsModalOpen).toHaveBeenCalled();
    expect(setIsModalOpen).toBeCalledTimes(1);
  });

  it('should render input box for completed status', () => {
    props.instanceStatus = InstanceStatus.COMPLETED;

    const { getByText } = setup(props);
    expect(getByText('instance_name_label')).toBeInTheDocument();
    const input: any = getByText('instance_name_label').parentElement;
    expect(input?.lastChild).toBeInTheDocument();
    expect(input.lastChild.className).toEqual('pf-c-form-control');
  });

  it('should render confirm button be disabled for empty or invalid input of instance with completed status', () => {
    props.instanceStatus = InstanceStatus.COMPLETED;
    const { getByText, getByRole } = setup(props);

    const inputElement: any = getByText('instance_name_label').parentElement?.lastChild;
    const confirmBtn: any = getByRole('button', { name: /confirm/i });

    expect(confirmBtn).toBeDisabled();
    act(() => {
      userEvent.type(inputElement, selectedInstance?.name || 'test');
    });

    //should match with exact input value
    expect(inputElement.value).toMatch(selectedInstance?.name || 'test');
    // confirm button get enabled if data matches.
    expect(confirmBtn).toBeEnabled();
  });

  it('should render large modal with success icon', () => {
    const propsData = Object.assign({}, props);
    propsData.variant = ModalVariant.large;
    propsData.titleIconVariant = 'success';
    propsData.instanceStatus = InstanceStatus.FAILED;

    const { getByRole } = setup(propsData);
    const classList: string[] = getByRole('dialog', { name: /delete_insta/i }).className.split(' ');
    //check the modal variant is large
    expect(classList).toContain('pf-m-lg');
    // check the title icon variant is success
    expect(classList).toContain('pf-m-success');
  });

  it('should render small modal with warning icon', () => {
    const propsData = Object.assign({}, props);
    propsData.variant = undefined;
    props.titleIconVariant = undefined;
    const { getByRole } = setup(propsData);
    const classList: string[] = getByRole('dialog', { name: /delete_insta/i }).className.split(' ');

    //check the modal variant is small
    expect(classList).toContain('pf-m-sm');
    // check the title icon variant is warning
    expect(classList).toContain('pf-m-warning');
  });

  it('should render with name and description as undefined', () => {
    const propsData = Object.assign({}, props);
    propsData.selectedInstance = { id: 'test-id', name: undefined };
    props.description = undefined;

    const { getByRole } = setup(propsData);

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('should render with default label for cancel and delete instance modal', () => {
    const propsData = Object.assign({}, props);
    propsData.confirmActionLabel = undefined;
    propsData.cancelActionLabel = undefined;
    const { getByText } = setup(propsData);

    getByText('delete_instance');
    getByText('cancel');
  });
});
