import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { PaginationVariant } from '@patternfly/react-core';
import { MASPagination, PaginationProps } from './MASPagination';

afterEach(cleanup);

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
  useLocation: () => ({
    search: '',
  }),
}));

describe('<MASPagination/>', () => {
  const props: PaginationProps = {
    page: 1,
    itemCount: 10,
    isCompact: false,
  };
  const renderSetup = (props) => {
    return render(<MASPagination {...props} />);
  };

  it('should render default MASPagination', () => {
    //arrange
    const { container } = renderSetup(props);

    //assert
    expect(container.getElementsByClassName('pf-c-pagination').length).toBe(1);
    expect(
      container.getElementsByClassName(
        'pf-c-pagination__nav-control pf-m-first'
      ).length
    ).toBe(1);
    expect(
      container.getElementsByClassName('pf-c-pagination__total-items').length
    ).toBe(1);
    screen.getAllByText(/1/);
    screen.getAllByText(/10/);
  });

  it('should render MASPagination with props and disabeld previous, next, first  and last button if total page is 1', () => {
    //arrange
    const newPorps = {
      ...props,
      page: 2,
      titles: {
        paginationTitle: 'full pagination',
        perPageSuffix: 'per page',
        toFirstPage: 'Go to first page',
        toPreviousPage: 'Go to previous page',
        toLastPage: 'Go to last page',
        toNextPage: 'Go to next page',
        optionsToggle: 'Items per page',
        currPage: 'Current page',
      },
      variant: PaginationVariant.bottom,
    };

    const { container } = renderSetup(newPorps);

    //assert
    expect(
      container.getElementsByClassName('pf-c-pagination pf-m-bottom').length
    ).toBe(1);
    screen.getAllByLabelText(/Items per page/);
    screen.getAllByLabelText(/full pagination/);
    //current page
    expect(container.getElementsByClassName('pf-c-form-control').length).toBe(
      1
    );
    const currentPageButton: any = screen.getByLabelText(/Current page/);
    expect(currentPageButton).toBeDisabled();
    expect(currentPageButton).toHaveValue(1);
    expect(currentPageButton).toHaveAttribute('min', '1');
    expect(currentPageButton).toHaveAttribute('max', '1');
    //first page
    const firstPageButton: any = screen.getByLabelText(/Go to first page/);
    expect(firstPageButton).toHaveClass('pf-m-disabled');
    //last page
    const lastPageButton: any = screen.getByLabelText(/Go to last page/);
    expect(lastPageButton).toHaveClass('pf-m-disabled');
    //previous button
    const previousPageButton: any =
      screen.getByLabelText(/Go to previous page/);
    expect(previousPageButton).toHaveClass('pf-m-disabled');
    //next button
    const nextPageButton: any = screen.getByLabelText(/Go to next page/);
    expect(nextPageButton).toHaveClass('pf-m-disabled');
  });

  it('should enabled previous, next, first and last button if total page is more than 1', () => {
    //arrange
    const props = {
      page: 1,
      itemCount: 30,
      isCompact: false,
      titles: {
        paginationTitle: 'full pagination',
        perPageSuffix: 'per page',
        toFirstPage: 'Go to first page',
        toPreviousPage: 'Go to previous page',
        toLastPage: 'Go to last page',
        toNextPage: 'Go to next page',
        optionsToggle: 'Items per page',
        currPage: 'Current page',
      },
      variant: PaginationVariant.bottom,
    };

    const { container } = renderSetup(props);

    //assert
    expect(
      container.getElementsByClassName('pf-c-pagination pf-m-bottom').length
    ).toBe(1);
    //current page
    expect(container.getElementsByClassName('pf-c-form-control').length).toBe(
      1
    );
    const currentPageButton: any = screen.getByLabelText(/Current page/);
    expect(currentPageButton).not.toBeDisabled();
    expect(currentPageButton).toHaveValue(1);
    expect(currentPageButton).toHaveAttribute('min', '1');
    expect(currentPageButton).toHaveAttribute('max', '3');
    //first page
    const firstPage: any = screen.getByLabelText(/Go to first page/);
    expect(firstPage).toHaveClass('pf-m-disabled');
    //last page
    const lastPage: any = screen.getByLabelText(/Go to last page/);
    expect(lastPage).not.toHaveClass('pf-m-disabled');
    //previous button
    const previousButton: any = screen.getByLabelText(/Go to previous page/);
    expect(previousButton).toHaveClass('pf-m-disabled');
    //next button
    const nextButton: any = screen.getByLabelText(/Go to next page/);
    expect(nextButton).not.toHaveClass('pf-m-disabled');
  });

  it('should render MASPagination with compact mode and top variant', () => {
    //arrange
    const props = {
      page: 1,
      itemCount: 30,
      isCompact: true,
      variant: PaginationVariant.top,
    };

    const { container } = renderSetup(props);

    //assert
    expect(container.getElementsByClassName('pf-m-compact').length).toBe(1);
  });
});
