import * as React from 'react';
import { EmptyState } from './EmptyState';
import { render, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

describe('Empty State Test', () => {
  test('should render empty state component', () => {
    const { getByTestId } = render(
      <EmptyState createStreamsInstance={false} setCreateStreamsInstance={jest.fn()} mainToggle={false} />
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
