import React from 'react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { StreamsToolbar, StreamsToolbarProps } from './StreamsToolbar';
import { render, screen, act, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18nForTest from '../../../../test-utils/i18n';

const streamsToolbarProps = {
  createStreamsInstance: false,
  setCreateStreamsInstance: jest.fn(),
  mainToggle: false,
  filterSelected: 'name',
  setFilterSelected: jest.fn(),
  total: 10,
  page: 1,
  perPage: 10,
  filteredValue: [],
  setFilteredValue: jest.fn(),
};

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

describe('<StreamsToolbar />', () => {
  const setup = (args: StreamsToolbarProps) => {
    return render(
      <MemoryRouter>
        <I18nextProvider i18n={i18nForTest}>
          <StreamsToolbar {...args} />
        </I18nextProvider>
      </MemoryRouter>
    );
  };
  it('it should render default toolbar', () => {
    const { getByRole, getByText } = setup(streamsToolbarProps);
    expect(getByText('Create Kafka instance')).toBeInTheDocument();
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByRole('searchbox', { name: /Search filter name input/i })).toBeInTheDocument();
  });

  it.only('it should have all option in filter dropdown', () => {
    const { getAllByRole,getByRole } = setup({...streamsToolbarProps,filterSelected:'status'});

    const button = getAllByRole('buton');
    
    expect(button).toBeDefined();
    expect(getByRole('button', { name: /Filter By/i })).toBeInTheDocument();
  });
});
