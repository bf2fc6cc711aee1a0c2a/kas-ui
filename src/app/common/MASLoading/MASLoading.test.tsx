import React from 'react';

import { render } from '@testing-library/react';
import { MASLoading } from './MASLoading';

describe('MASLoading Component', () => {
  test('should render cloud dot spinner in bullseye format', () => {
    const { getByRole } = render(<MASLoading />);

    getByRole('status');
  });
});
