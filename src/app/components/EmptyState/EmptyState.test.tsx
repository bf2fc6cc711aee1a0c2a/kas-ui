import * as React from 'react';
import { EmptyState } from './EmptyState';
import { render, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('react-i18next', () => {
  const reactI18next = jest.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: jest.fn() } }),
  };
});

describe('Empty State Test', () => {
  test('should render empty state component', () => {
    const { getByText, getByRole } = render(
      <EmptyState createStreamsInstance={false} setCreateStreamsInstance={jest.fn()} mainToggle={false} />
    );
    expect(getByText('you_do_not_have_any_kafka_instances_yet')).toBeInTheDocument();
    expect(getByText('create_a_kafka_instance')).toBeInTheDocument();
    expect(getByText('create_a_kafka_instance_to_get_started')).toBeInTheDocument();
    expect(getByText('you_do_not_have_any_kafka_instances_yet')).toBeInTheDocument();
    expect(getByRole('button', { name: /create_a_kafka/i })).toBeInTheDocument();
  });

  test('should allow user to create instance', () => {
    const onCreate = jest.fn();
    const { getByRole } = render(
      <EmptyState createStreamsInstance={false} setCreateStreamsInstance={onCreate} mainToggle={false} />
    );

    act(() => {
      const button = getByRole('button', { name: /create_a_kafka/i });
      userEvent.click(button);
    });

    expect(onCreate).toBeCalledTimes(1);
  });
});
