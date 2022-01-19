import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AlertContext,
  Auth,
  AuthContext,
  Config,
  ConfigContext,
  Quota,
  QuotaContext,
} from '@rhoas/app-services-ui-shared';
import { AxiosResponse } from 'axios';

const listCloudProviderRegions: AxiosResponse = {
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
} as AxiosResponse;

const actualSDK = jest.requireActual('@rhoas/kafka-management-sdk');

import { CreateInstance } from './CreateInstance';

jest.mock('@rhoas/kafka-management-sdk', () => {
  return {
    ...actualSDK,
    DefaultApi: jest.fn().mockImplementation(() => {
      return {
        listCloudProviderRegions: () => {
          return Promise.resolve(listCloudProviderRegions);
        },
      };
    }),
  };
});

const setupRender = () => {
  render(
    <ConfigContext.Provider
      value={
        {
          kas: {
            apiBasePath: '',
          },
          ams: { trialQuotaId: 'fake-quota-id' },
        } as unknown as Config
      }
    >
      <AuthContext.Provider
        value={
          {
            kas: {
              getToken: () => Promise.resolve('test-token'),
            },
            getUsername: () => Promise.resolve('api_kafka_service'),
          } as Auth
        }
      >
        <AlertContext.Provider
          value={{
            addAlert: () => {
              // No-op
            },
          }}
        >
          <QuotaContext.Provider
            value={{
              getQuota: () => {
                return Promise.resolve({
                  loading: true,
                  data: undefined,
                  isServiceDown: false,
                } as Quota);
              },
            }}
          >
            <CreateInstance
              title='Create a Kafka instance'
              hideModal={() => {
                //no-op
              }}
            />
          </QuotaContext.Provider>
        </AlertContext.Provider>
      </AuthContext.Provider>
    </ConfigContext.Provider>
  );
};

describe('<CreateInstance/>', () => {
  it('should open create instance modal if createStreamsInstance is true', () => {
    //arange
    setupRender();

    //assert
    expect(screen.getByText('Create a Kafka instance')).toBeInTheDocument();
  });

  // TODO Fix test
  it.skip('should call listCloudProviderRegions api by default and set the data in state', async () => {
    //arrange
    setupRender();

    //assert
    await waitFor(() => {
      expect(screen.getByText('US East, N. Virginia')).toBeInTheDocument();
    });
  });

  it('should enabled create instance button by default', () => {
    //arrage
    setupRender();

    //act
    const classList: string[] = screen
      .getByRole('button', { name: /create_instance/i })
      .className.split(' ');

    //assert
    expect(
      screen.getByRole('button', { name: /create_instance/i })
    ).toBeInTheDocument();
    expect(classList).toContain('pf-m-primary');
    expect(classList).toContain('pf-c-button');
    //expect(classList).not.toContain('pf-m-disabled');
  });

  it('should disable the Create Instance Button if the mandatory fields are empty', async () => {
    //arrange
    setupRender();

    //act
    const btn = screen.getByRole('button', { name: /create_instance/i });
    act(() => {
      userEvent.click(btn);
    });

    //assert
    await waitFor(() => {
      const classList: string[] = screen
        .getByRole('button', { name: /create_instance/i })
        .className.split(' ');
      expect(
        screen.getByRole('button', { name: /create_instance/i })
      ).toBeInTheDocument();
      expect(classList).toContain('pf-m-primary');
      expect(classList).toContain('pf-c-button');
      expect(classList).toContain('pf-m-disabled');
      expect(
        screen.getByRole('button', { name: /create_instance/i })
      ).toBeDisabled();
    });
  });

  it('should enabled create instance button if filled all the mandatory fileds', async () => {
    //arrange
    setupRender();
    const createInstanceButton = screen.getByRole('button', {
      name: /create_instance/i,
    });

    //act
    act(() => {
      userEvent.click(createInstanceButton);
    });
    const instanceNameInput = screen.getByRole('textbox', {
      name: /Name/i,
    });
    act(() => {
      userEvent.type(instanceNameInput, '1');
    });

    //assert
    const classList: string[] = screen
      .getByRole('button', { name: /create_instance/i })
      .className.split(' ');
    expect(
      screen.getByRole('button', { name: /create_instance/i })
    ).toBeInTheDocument();
    expect(classList).toContain('pf-m-primary');
    expect(classList).toContain('pf-c-button');
    //expect(classList).not.toContain('pf-m-disabled');
    //expect(screen.getByRole('button', { name: /create_instance/i })).toBeEnabled();
    expect(instanceNameInput).toHaveValue('1');
  });

  it('should disabled create instance button and show error message if enter invalid instance name', async () => {
    //arrange
    setupRender();

    //act
    const createInstanceButton = screen.getByRole('button', {
      name: /create_instance/i,
    });
    act(() => {
      userEvent.click(createInstanceButton);
    });
    const instanceNameInput = screen.getByRole('textbox', {
      name: /Name/i,
    });
    act(() => {
      userEvent.type(instanceNameInput, '@');
    });

    //assert
    await waitFor(() => {
      const classList: string[] = screen
        .getByRole('button', { name: /create_instance/i })
        .className.split(' ');
      expect(
        screen.getByRole('button', { name: /create_instance/i })
      ).toBeInTheDocument();
      expect(classList).toContain('pf-m-primary');
      expect(classList).toContain('pf-c-button');
      expect(classList).toContain('pf-m-disabled');
      expect(
        screen.getByRole('button', { name: /create_instance/i })
      ).toBeDisabled();
      expect(instanceNameInput).toHaveValue('@');
      expect(
        screen.getByText('common.input_filed_invalid_helper_text')
      ).toBeInTheDocument();
    });
  });
});
