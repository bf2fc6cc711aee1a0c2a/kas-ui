import React from 'react';
import { MASDeleteModal, MASDeleteModalProps } from './MASDeleteModal';

import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KafkaRequest } from 'src/openapi';
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

const props: MASDeleteModalProps = {
  isModalOpen: true,
  selectedItemData: selectedInstance,
  handleModalToggle: setIsModalOpen,
  modalProps: {
    title: 'test title',
    titleIconVariant: 'warning',
  },
  confirmButtonProps: {
    onClick: onConfirm,
    label: 'confirm',
  },
  textProps: {
    description: `The ${selectedInstance.name} instance will be deleted.`,
  },
  cancelButtonProps: {
    label: 'cancel',
  },
};

const setup = (args: MASDeleteModalProps) => {
  return render(<MASDeleteModal {...args} />);
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

  xit('should render input box for ready status', () => {
    const { getByText } = setup(props);
    expect(getByText('instance_name_label')).toBeInTheDocument();
    const input: any = getByText('instance_name_label').parentElement;
    expect(input?.lastChild).toBeInTheDocument();
    expect(input.lastChild.className).toEqual('pf-c-form-control');
  });

  xit('should render confirm button be disabled for empty or invalid input of instance with ready status', () => {
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
    propsData.modalProps.variant = ModalVariant.large;
    propsData.modalProps.titleIconVariant = 'success';

    const { getByRole } = setup(propsData);
    const classList: string[] = getByRole('dialog', { name: /test title/i }).className.split(' ');
    //check the modal variant is large
    expect(classList).toContain('pf-m-lg');
    // check the title icon variant is success
    expect(classList).toContain('pf-m-success');
  });

  it('should render small modal with warning icon', () => {
    const propsData = Object.assign({}, props);
    propsData.modalProps.variant = undefined;
    props.modalProps.titleIconVariant = undefined;
    const { getByRole } = setup(propsData);
    const classList: string[] = getByRole('dialog', { name: /test title/i }).className.split(' ');

    //check the modal variant is small
    expect(classList).toContain('pf-m-sm');
    // check the title icon variant is warning
    expect(classList).toContain('pf-m-warning');
  });

  it('should render with name and description as undefined', () => {
    const propsData = Object.assign({}, props);
    propsData.selectedItemData = { id: 'test-id', name: undefined };

    const { getByRole } = setup(propsData);

    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('should render with default label for cancel and delete instance modal', () => {
    const propsData = Object.assign({}, props);
    propsData.confirmButtonProps = {
      label: undefined,
    };
    propsData.cancelButtonProps = { label: undefined };

    const { getByText } = setup(propsData);

    getByText('Delete');
    getByText('Cancel');
  });
});
