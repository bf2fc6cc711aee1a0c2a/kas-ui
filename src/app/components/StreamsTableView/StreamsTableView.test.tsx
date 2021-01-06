import React from 'react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { StreamsTableView, TableProps } from './StreamsTableView';
import { render, screen, act, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from '../../../../test-utils/i18n';
import { AuthContext } from '@app/auth/AuthContext';

const kafkaInstanceItems = [
  {
    id: '1iSY6RQ3JKI8Q0OTmjQFd3ocFRg',
    kind: 'kafka',
    href: '/api/managed-services-api/v1/kafkas/1iSY6RQ3JKI8Q0OTmjQFd3ocFRg',
    status: 'complete',
    cloud_provider: 'aws',
    multi_az: false,
    region: 'us-east-1',
    owner: 'api_kafka_service',
    name: 'serviceapi',
    bootstrapServerHost: 'serviceapi-1isy6rq3jki8q0otmjqfd3ocfrg.apps.ms-bttg0jn170hp.x5u8.s1.devshift.org',
    created_at: '2020-10-05T12:51:24.053142Z',
    updated_at: '2020-10-05T12:56:36.362208Z',
  },
];

jest.mock('../../../openapi/api', () => {
  // Works and lets you check for constructor calls:
  return {
    DefaultApi: jest.fn().mockImplementation(() => {
      return {
        deleteKafkaById: Promise.resolve(''),
      };
    }),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('<StreamsTableView/>', () => {
  const setup = (args: any) => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18nForTest}>
          <AuthContext.Provider
            value={{
              getToken: () => Promise.resolve('test-token'),
              getUsername: () => Promise.resolve('api_kafka_service'),
            }}
          >
            <StreamsTableView {...args} />
          </AuthContext.Provider>
        </I18nextProvider>
      </MemoryRouter>
    );
  };

  const props: TableProps = {
    createStreamsInstance: false,
    setCreateStreamsInstance: jest.fn(),
    kafkaInstanceItems,
    onViewInstance: jest.fn(),
    onViewConnection: jest.fn(),
    onConnectToInstance: jest.fn(),
    mainToggle: false,
    refresh: jest.fn(),
    page: 1,
    perPage: 10,
    total: 1,
    kafkaDataLoaded: true,
    expectedTotal: 1,
  };

  it('should render translation text in English language', () => {
    setup(props);
    expect(screen.getByText('US East, N. Virginia')).toBeInTheDocument();
  });

  it('should render DeleteInstanceModal component if isDeleteModalOpen is true', async () => {
    setup(props);
    let btn: any;
    await waitFor(() => {
      btn = screen.getByText('api_kafka_service')?.parentElement?.lastChild?.lastChild?.lastChild;
    });
    act(() => {
      userEvent.click(btn);
    });
    const btnDeleteInstance: any = screen.getByRole('button', { name: /Delete instance/i });
    expect(screen.getByText('Delete instance')).toBeInTheDocument();
    act(() => {
      userEvent.click(btnDeleteInstance);
    });
    //check delete instance modal is open
    screen.getByRole('textbox', { name: /Please type serviceapi to confirm./i });
  });

  it('should disabled delete instance kebab button if ower and loggedInUser are not same', () => {
    props.kafkaInstanceItems[0].owner = 'test-user';
    setup(props);
    let btn: any = screen.getByText('test-user')?.parentElement?.lastChild?.lastChild?.lastChild;
    act(() => {
      userEvent.click(btn);
    });
    const classList: string[] = screen.getByRole('button', { name: /Delete instance/i }).className.split(' ');
    expect(classList).toContain('pf-m-disabled');
  });

  it('should call delete instance api and delete instance', async () => {
    setup(props);
    let btn: any;

    await waitFor(() => {
      //get kebab button
      btn = screen.getByText('api_kafka_service')?.parentElement?.lastChild?.lastChild?.lastChild;
    });

    act(() => {
      //open kebab drop down
      userEvent.click(btn);
    });

    const btnDeleteInstance: any = screen.getByRole('button', { name: /Delete instance/i });
    act(() => {
      //click on delete instance button
      userEvent.click(btnDeleteInstance);
    });

    let eleDialog: any;
    let btnConfirm: any;

    await waitFor(() => {
      eleDialog = screen.getByRole('dialog', { name: /Delete instance?/i });
      btnConfirm = eleDialog?.lastChild?.firstChild;
    });

    act(() => {
      userEvent.click(btnConfirm);
    });
  });
});
