import React from 'react';
import { MemoryRouter } from 'react-router';
import { StreamsTableView, TableProps } from './StreamsTableView';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from '../../../../test-utils/i18n';
import i18n from 'i18next';

jest.mock('../../../openapi/api', () => {
  // Works and lets you check for constructor calls:
  return {
    DefaultApi: jest.fn().mockImplementation(() => {
      return {
        createKafka: () => {},
        createServiceAccount: () => {},
        deleteKafkaById: () => {},
        deleteServiceAccount: () => {},
        getKafkaById: () => {},
        listCloudProviderRegions: () => {},
        listCloudProviders: () => {},
      };
    }),
  };
});

describe('<StreamsTableView/>', () => {
  const setup = (args: any) => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18nForTest}>
          <StreamsTableView {...args} />
        </I18nextProvider>
      </MemoryRouter>
    );
  };

  const props: TableProps = {
    createStreamsInstance: false,
    setCreateStreamsInstance: jest.fn(),
    kafkaInstanceItems: [
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
    ],
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

  it('should render translation text in Japaneese language', () => {
    i18n.changeLanguage('ja');
    setup(props);
    //screen.debug();
    expect(screen.getByText('日本語 US East, N. Virginia')).toBeInTheDocument();
  });
});
