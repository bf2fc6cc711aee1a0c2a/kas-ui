import React from 'react';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { ButtonVariant, PageSectionVariants } from '@patternfly/react-core';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MASFullPageError, MASFullPageErrorProps } from './MASFullPageError';

describe('<MASFullPageError/>', () => {
  it('should render default MASFullPageError', () => {
    //arrange
    const { container } = render(<MASFullPageError />);

    //assert
    expect(container.getElementsByClassName('pf-c-page__main-section pf-m-no-padding').length).toBe(1);
    expect(container.getElementsByClassName('pf-c-empty-state pf-u-pt-2xl pf-u-pt-3xl-on-md').length).toBe(1);
    expect(container.getElementsByClassName('pf-c-empty-state__content').length).toBe(1);
    expect(container.getElementsByClassName('pf-c-empty-state__icon').length).toBe(1);
  });

  it('should render MASFullPageError with props', () => {
    //arrange
    const onClick = jest.fn();
    const props: MASFullPageErrorProps = {
      pageSection: {
        variant: PageSectionVariants.light,
        padding: { sm: 'padding' },
        className: 'pagesection-class',
        type: 'default',
      },
      titleProps: { title: 'empty state', headingLevel: 'h1', size: '2xl' },
      emptyStateProps: { className: 'empty-state-class', variant: 'large', isFullHeight: true },
      emptyStateIconProps: { className: 'icon-class', icon: MinusCircleIcon, variant: 'icon' },
      emptyStateBodyProps: { className: 'empty-body-class', body: 'This is empty state body' },
      buttonProps: { title: 'Home Page', variant: ButtonVariant.primary, onClick },
    };

    const { container } = render(<MASFullPageError {...props} />);

    //act
    act(() => {
      const button = screen.getByRole('button', { name: /Home Page/i });
      userEvent.click(button);
    });

    //assert
    expect(
      container.getElementsByClassName('pf-c-page__main-section pf-m-padding-on-sm pf-m-light pagesection-class').length
    ).toBe(1);
    expect(container.getElementsByClassName('empty-state-class').length).toBe(1);
    expect(container.getElementsByClassName('icon-class').length).toBe(1);
    expect(container.getElementsByClassName('empty-body-class').length).toBe(1);
    //check height css
    expect(container.getElementsByClassName('pf-m-full-height').length).toBe(1);
    screen.getAllByText(/empty state/);
    screen.getAllByText(/This is empty state body/);
    screen.getAllByText(/Home Page/);
    expect(onClick).toHaveBeenCalled();
  });
});
