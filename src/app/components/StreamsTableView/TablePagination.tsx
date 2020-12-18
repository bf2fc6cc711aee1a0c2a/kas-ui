import React, { useCallback, FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router';
import { Pagination, PaginationProps, PaginationTitles } from '@patternfly/react-core';

export const TablePagination: FunctionComponent<PaginationProps & Pick<PaginationTitles,'paginationTitle'>> = ({
  page,
  perPage,
  itemCount,
  variant,
  isCompact,
  paginationTitle,
}) => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      searchParams.set(name, value.toString());
    },
    [searchParams]
  );

  const onSetPage = useCallback(
    (_: any, newPage: number) => {
      setSearchParam('page', newPage.toString());
      history.push({
        search: searchParams.toString(),
      });
    },
    [setSearchParam, history, searchParams]
  );

  const onPerPageSelect = useCallback(
    (_: any, newPerPage: number) => {
      setSearchParam('page', '1');
      setSearchParam('perPage', newPerPage.toString());
      history.push({
        search: searchParams.toString(),
      });
    },
    [setSearchParam, history, searchParams]
  );

  if (itemCount && itemCount > 0) {
    return (
      <Pagination
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        variant={variant || 'top'}
        onPerPageSelect={onPerPageSelect}
        isCompact={isCompact}
        titles={{ paginationTitle }}
      />
    );
  }
  return null;
};
