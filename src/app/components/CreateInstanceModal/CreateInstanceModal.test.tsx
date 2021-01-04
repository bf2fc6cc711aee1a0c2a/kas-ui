import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { I18nextProvider } from 'react-i18next';
import { CreateInstanceModal, CreateInstanceModalProps } from './CreateInstanceModal';
import i18nForTest from '../../../../test-utils/i18n';
import { AuthContext } from '@app/auth/AuthContext';

jest.mock('../../../openapi/api', () => {
  // Works and lets you check for constructor calls:
  return {
    DefaultApi: jest.fn().mockImplementation(() => {
      const res: any = {
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
      return {
        listCloudProviderRegions: () => {
          return Promise.resolve(res);
        },
        listCloudProviders: () => {},
      };
    }),
  };
});

afterEach(cleanup);

const setupRender = (props: CreateInstanceModalProps) => {
  render(
    <I18nextProvider i18n={i18nForTest}>
      <AuthContext.Provider value={{ getToken: () => Promise.resolve('test-token') }}>
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
    setupRender(props);
    expect(screen.getByText('Create a Kafka instance')).toBeInTheDocument();
  });

  it('should call listCloudProviderRegions api by default and set the data in state', async () => {
    setupRender(props);  
    await waitFor(() => {
      screen.getByTestId('cloud-region-select');
      expect(screen.getByText('US East, N. Virginia')).toBeInTheDocument();
    });
  });
});
