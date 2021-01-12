import React from 'react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { StreamsTableView, TableProps } from './StreamsTableView';
import { render, screen, act, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from '../../../../test-utils/i18n';
import { AuthContext, IAuthContext } from '@app/auth/AuthContext';

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
        deleteKafkaById: () => Promise.resolve(),
      };
    }),
  };
});

describe('<StreamsTableView/>', () => {
  const setup = (
    args: any,
    authValue: IAuthContext = {
      getToken: () => Promise.resolve('test-token'),
      getUsername: () => Promise.resolve('api_kafka_service'),
    }
  ) => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18nForTest}>
          <AuthContext.Provider value={authValue}>
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
    filteredValue: [],
    setFilteredValue: jest.fn(),
    filterSelected: '',
    setFilterSelected: jest.fn(),
    orderBy: '',
    setOrderBy: jest.fn(),
  };

  it('should render translation text in English language', () => {
    //arrange
    setup(props);

    //assert
    expect(screen.getByText('US East, N. Virginia')).toBeInTheDocument();
  });

  it('should render the Delete Instance Modal component if isDeleteModalOpen is true', async () => {
    //arrange
    setup(props);

    //act
    let kebabDropdownButton: any;
    await waitFor(() => {
      kebabDropdownButton = screen.getByText('api_kafka_service')?.parentElement?.lastChild?.lastChild?.lastChild;
    });
    act(() => {
      userEvent.click(kebabDropdownButton);
    });
    const deleteInstanceButton: any = screen.getByRole('button', { name: /Delete instance/i });

    //assert
    expect(screen.getByText('Delete instance')).toBeInTheDocument();
    act(() => {
      userEvent.click(deleteInstanceButton);
    });
    //check delete instance modal is open
    expect(screen.getByRole('heading', { name: /Delete instance?/i })).toBeInTheDocument();
  });

  it('should disable the delete instance kebab button if the ower and loggedInUser are not the same', () => {
    //arrange
    const newProps = Object.assign({}, props);
    newProps.kafkaInstanceItems[0].owner = 'test-user';
    setup(newProps);

    //act
    const kebabDropdownButton: any = screen.getByText('test-user')?.parentElement?.lastChild?.lastChild?.lastChild;
    act(() => {
      userEvent.click(kebabDropdownButton);
    });
    const classList: string[] = screen.getByRole('button', { name: /Delete instance/i }).className.split(' ');

    //assert
    expect(classList).toContain('pf-m-disabled');
  });
});
