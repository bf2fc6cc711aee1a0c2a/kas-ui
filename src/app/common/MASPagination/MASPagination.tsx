import React, { useCallback, FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  Pagination as PFPagination,
  PaginationProps as PFPaginationProps,
  PaginationVariant,
} from '@patternfly/react-core';

export type PaginationProps = Omit<PFPaginationProps, 'children' | 'ref'>;

const MASPagination: FunctionComponent<PaginationProps> = ({
  page,
  perPage = 10,
  itemCount,
  variant = PaginationVariant.top,
  isCompact,
  titles,
  ...restProps
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
    (_: unknown, newPage: number) => {
      setSearchParam('page', newPage.toString());
      history.push({
        search: searchParams.toString(),
      });
    },
    [setSearchParam, history, searchParams]
  );

  const onPerPageSelect = useCallback(
    (_: unknown, newPerPage: number) => {
      setSearchParam('page', '1');
      setSearchParam('perPage', newPerPage.toString());
      history.push({
        search: searchParams.toString(),
      });
    },
    [setSearchParam, history, searchParams]
  );

  return (
    <PFPagination
      itemCount={itemCount}
      perPage={perPage}
      page={page}
      onSetPage={onSetPage}
      variant={variant}
      onPerPageSelect={onPerPageSelect}
      isCompact={isCompact}
      {...restProps}
      titles={titles}
    />
  );
};

export { MASPagination };
