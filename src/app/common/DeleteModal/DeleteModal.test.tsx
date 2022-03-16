import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalVariant } from '@patternfly/react-core';
import { TextInput } from '@patternfly/react-core';
import { DeleteModal, DeleteModalProps } from './DeleteModal';

type TestRequest = {
  name: string;
};

describe('<DeleteModal/>', () => {
  const handleModalToggle = jest.fn();
  const props: DeleteModalProps<TestRequest> = {
    isModalOpen: true,
    title: 'test title',
    handleModalToggle,
  };

  const renderSetup = (props: DeleteModalProps<TestRequest>) => {
    return render(<DeleteModal {...props} />);
  };

  it('should render default DeleteModal', () => {
    //arrange
    const { container } = renderSetup(props);

    //assert
    screen.getByText('test title');
    expect(container).toHaveAttribute('aria-hidden', 'true');
    screen.getByRole('button', { name: /Delete/ });
    screen.getByRole('button', { name: /Cancel/ });
  });

  it('should render DeleteModal with custom props', () => {
    //arrange
    const onDelete = jest.fn();
    const props = {
      isModalOpen: true,
      title: 'test title',
      modalProps: {
        variant: ModalVariant.medium,
        ['aria-label']: 'delete modal',
        showClose: true,
      },
      handleModalToggle,
      selectedItemData: { name: 'test-item' },
      confirmButtonProps: {
        id: 'delete-button',
        key: 'delete-button',
        onClick: onDelete,
        label: 'Delete',
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
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      userEvent.click(deleteButton);
    });

    //assert
    expect(onDelete).toHaveBeenCalled();
    screen.getByText('test title');
    expect(container).toHaveAttribute('aria-hidden', 'true');
    screen.getByRole('button', { name: /Delete/i });
    screen.getByRole('button', { name: /Cancel instance/i });
    screen.getByText('This is test instance');

    //act
    act(() => {
      const cancelButton = screen.getByRole('button', {
        name: /Cancel instance/i,
      });
      userEvent.click(cancelButton);
    });
    //assert
    expect(handleModalToggle).toHaveBeenCalled();
  });

  it('should render DeleteModal with children', () => {
    //arrange
    const selectedInstanceName = 'test-instance';
    const onKeyPress = jest.fn();
    const handleInstanceName = jest.fn();

    render(
      <DeleteModal {...props}>
        <>
          <label
            htmlFor='instance-name-input'
            dangerouslySetInnerHTML={{
              __html: `Type <b>${selectedInstanceName}</b> to confirm`,
            }}
          />
          <TextInput
            id='mk--instance-name__input'
            name='instance-name-input'
            type='text'
            value={selectedInstanceName}
            onChange={handleInstanceName}
            onKeyPress={onKeyPress}
            autoFocus={true}
          />
        </>
      </DeleteModal>
    );

    const inputField = screen.getByRole('textbox');
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
