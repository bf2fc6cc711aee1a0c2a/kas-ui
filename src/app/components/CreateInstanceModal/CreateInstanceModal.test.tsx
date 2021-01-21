import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import userEvent from '@testing-library/user-event';
import { CreateInstanceModal, CreateInstanceModalProps } from './CreateInstanceModal';
import i18nForTest from '../../../../test-utils/i18n';
import { AuthContext } from '@app/auth/AuthContext';

const listCloudProviderRegions: any = {
  data: {
    items: [
      {
        display_name: 'US East, N. Virginia',
        enabled: true,
        id: 'us-east-1',
        kind: 'CloudRegion',
      },
    ],
  },
};

jest.mock('../../../openapi/api', () => {
  // Works and lets you check for constructor calls:
  return {
    DefaultApi: jest.fn().mockImplementation(() => {
      return {
        listCloudProviderRegions: () => {
          return Promise.resolve(listCloudProviderRegions);
        },
      };
    }),
  };
});

const setupRender = (props: CreateInstanceModalProps) => {
  render(
    <I18nextProvider i18n={i18nForTest}>
      <AuthContext.Provider
        value={{
          getToken: () => Promise.resolve('test-token'),
          getUsername: () => Promise.resolve('api_kafka_service'),
        }}
      >
        <CreateInstanceModal {...props} />
      </AuthContext.Provider>
    </I18nextProvider>
  );
};

describe('<CreateInstanceModal/>', () => {
  const props: CreateInstanceModalProps = {
    createStreamsInstance: true,
    mainToggle: true,
    cloudProviders: [
      {
        display_name: 'Amazon Web Services',
        enabled: true,
        id: 'aws',
        kind: 'CloudProvider',
        name: 'aws',
      },
    ],
    setCreateStreamsInstance: jest.fn(),
    refresh: jest.fn(),
  };

  it('should open create instance modal if createStreamsInstance is true', () => {
    //arange
    setupRender(props);

    //assert
    expect(screen.getByText('Create a Kafka instance')).toBeInTheDocument();
  });

  it('should call listCloudProviderRegions api by default and set the data in state', async () => {
    //arrange
    setupRender(props);

    //assert
    await waitFor(() => {
      expect(screen.getByText(/US East, N. Virginia/i)).toBeInTheDocument();
    });
  });

  it('should enabled create instance button by default', () => {
    //arrage
    setupRender(props);

    //act
    const classList: string[] = screen.getByRole('button', { name: /Create instance/i }).className.split(' ');

    //assert
    expect(screen.getByRole('button', { name: /Create instance/i })).toBeInTheDocument();
    expect(classList).toContain('pf-m-primary');
    expect(classList).toContain('pf-c-button');
    expect(classList).not.toContain('pf-m-disabled');
  });

  it('should disable the Create Instance Button if the mandatory fields are empty', async () => {
    //arrange
    setupRender(props);

    //act
    const btn: any = screen.getByRole('button', { name: /Create instance/i });
    act(() => {
      userEvent.click(btn);
    });

    //assert
    await waitFor(() => {
      const classList: string[] = screen.getByRole('button', { name: /Create instance/i }).className.split(' ');
      expect(screen.getByRole('button', { name: /Create instance/i })).toBeInTheDocument();
      expect(classList).toContain('pf-m-primary');
      expect(classList).toContain('pf-c-button');
      expect(classList).toContain('pf-m-disabled');
      expect(screen.getByRole('button', { name: /Create instance/i })).toBeDisabled();
    });
  });

  it('should enabled create instance button if filled all the mandatory fileds', async () => {
    //arrange
    setupRender(props);
    const createInstanceButton: any = screen.getByRole('button', { name: /Create instance/i });

    //act
    act(() => {
      userEvent.click(createInstanceButton);
    });
    const instanceNameInput: any = screen.getByRole('textbox', { name: /Instance name/i });
    act(() => {
      userEvent.type(instanceNameInput, '1');
    });

    //assert
    const classList: string[] = screen.getByRole('button', { name: /Create instance/i }).className.split(' ');
    expect(screen.getByRole('button', { name: /Create instance/i })).toBeInTheDocument();
    expect(classList).toContain('pf-m-primary');
    expect(classList).toContain('pf-c-button');
    expect(classList).not.toContain('pf-m-disabled');
    expect(screen.getByRole('button', { name: /Create instance/i })).toBeEnabled();
    expect(instanceNameInput).toHaveValue('1');
  });

  it('should disabled create instance button and show error message if enter invalid instance name', async () => {
    //arrange
    setupRender(props);

    //act
    const createInstanceButton: any = screen.getByRole('button', { name: /Create instance/i });
    act(() => {
      userEvent.click(createInstanceButton);
    });
    const instanceNameInput: any = screen.getByRole('textbox', { name: /Instance name/i });
    act(() => {
      userEvent.type(instanceNameInput, '@');
    });

    //assert
    await waitFor(() => {
      const classList: string[] = screen.getByRole('button', { name: /Create instance/i }).className.split(' ');
      expect(screen.getByRole('button', { name: /Create instance/i })).toBeInTheDocument();
      expect(classList).toContain('pf-m-primary');
      expect(classList).toContain('pf-c-button');
      expect(classList).toContain('pf-m-disabled');
      expect(screen.getByRole('button', { name: /Create instance/i })).toBeDisabled();
      expect(instanceNameInput).toHaveValue('@');
      expect(
        screen.getByText(
          'Valid characters for instance name are lowercase letters from a to z, numbers from 0 to 9, and hyphens (-). The name must start with a letter, and must end with a letter or number.'
        )
      ).toBeInTheDocument();
    });
  });
});
