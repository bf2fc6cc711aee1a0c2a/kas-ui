import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalVariant } from '@patternfly/react-core';
import { TextInput } from '@patternfly/react-core';
import { MASDeleteModal, MASDeleteModalProps } from './MASDeleteModal';

describe('<MASDeleteModal/>', () => {
  const handleModalToggle = jest.fn();
  const props: MASDeleteModalProps = {
    isModalOpen: true,
    modalProps: { title: 'test title' },
    handleModalToggle,
  };

  const renderSetup = (props: MASDeleteModalProps) => {
    return render(<MASDeleteModal {...props} />);
  };

  it('should render default MASDeleteModal', () => {
    //arrange
    const { container } = renderSetup(props);

    //assert
    screen.getByText('test title');
    expect(container).toHaveAttribute('aria-hidden', 'true');
    screen.getByRole('button', { name: /Delete/ });
    screen.getByRole('button', { name: /Cancel/ });
  });

  it('should render MASDeleteModal with custom props', () => {
    //arrange
    const onDelete = jest.fn();
    const props = {
      isModalOpen: true,
      modalProps: {
        title: 'test title',
        variant: ModalVariant.medium,
        ['aria-label']: 'delete modal',
        showClose: true,
      },
      handleModalToggle,
      selectedItemData: { selectedItem: 'test-item' },
      confirmButtonProps: {
        id: 'delete-button',
        key: 'delete-button',
        onClick: onDelete,
        label: 'Delete instance',
      },
      cancelButtonProps: {
        id: 'cancel-button',
        key: 'cancel-button',
        label: 'Cancel instance',
      },
      textProps: {
        description: 'This is test instance',
      },
    };

    const { container } = renderSetup(props);

    //act
    act(() => {
      const deleteButton: any = screen.getByRole('button', { name: /Delete instance/i });
      userEvent.click(deleteButton);
    });

    //assert
    expect(onDelete).toHaveBeenCalled();
    screen.getByText('test title');
    expect(container).toHaveAttribute('aria-hidden', 'true');
    screen.getByRole('button', { name: /Delete instance/i });
    screen.getByRole('button', { name: /Cancel instance/i });
    screen.getByText('This is test instance');

    //act
    act(() => {
      const cancelButton: any = screen.getByRole('button', { name: /Cancel instance/i });
      userEvent.click(cancelButton);
    });
    //assert
    expect(handleModalToggle).toHaveBeenCalled();
  });

  it('should render MASDeleteModal with children', () => {
    //arrange
    const selectedInstanceName = 'test-instance';
    const onKeyPress = jest.fn();
    const handleInstanceName = jest.fn();

    render(
      <MASDeleteModal {...props}>
        <>
          <label
            htmlFor="instance-name-input"
            dangerouslySetInnerHTML={{ __html: `Please type <b>${selectedInstanceName}</b> to confirm` }}
          />
          <TextInput
            id="mk--instance-name__input"
            name="instance-name-input"
            type="text"
            value={selectedInstanceName}
            onChange={handleInstanceName}
            onKeyPress={onKeyPress}
            autoFocus={true}
          />
        </>
      </MASDeleteModal>
    );

    const inputField: any = screen.getByRole('textbox');
    //act
    act(() => {
      userEvent.type(inputField, 'test input');
    });

    //assert
    expect(handleInstanceName).toHaveBeenCalled();
    expect(inputField).toHaveValue(selectedInstanceName);
    expect(inputField).toHaveAttribute('id', 'mk--instance-name__input');
    expect(inputField).toHaveAttribute('name', 'instance-name-input');
  });
});
