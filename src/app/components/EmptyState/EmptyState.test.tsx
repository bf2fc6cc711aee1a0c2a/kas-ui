import * as React from 'react';
import { EmptyState } from './EmptyState';
import i18n from '../../../i18n/i18n';
import { render, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

jest.mock('react-i18next', () => {
  const reactI18next = require.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key }),
  };
});

describe('Empty State Test', () => {
  test('should render empty state component', () => {
    const { getByTestId, getByText } = render(
      <I18nextProvider i18n={i18n}>
        <EmptyState createStreamsInstance={false} setCreateStreamsInstance={jest.fn()} mainToggle={false} />
      </I18nextProvider>
    );
    getByTestId('empty-state-icon');
    getByTestId('empty-state-title');
    getByTestId('create-kafka-btn');
  });

  test('should allow user to create instance', () => {
    const onCreate = jest.fn();
    const { getByTestId } = render(
      <EmptyState createStreamsInstance={false} setCreateStreamsInstance={onCreate} mainToggle={false} />
    );

    const item = getByTestId('create-kafka-btn');
    fireEvent.click(item);
    expect(onCreate).toHaveBeenCalled();
  });
});
