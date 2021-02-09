import React from 'react';

import { render } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading Component', () => {
  test('should render cloud dot spinner in bullseye format', () => {
    const { getByRole } = render(<Loading />);

    getByRole('status');
  });
});
