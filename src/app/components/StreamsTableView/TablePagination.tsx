import React, { useCallback, FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router';
import { Pagination, PaginationProps, PaginationTitles } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface TablePagination extends PaginationProps, Pick<PaginationTitles, 'paginationTitle'> {}

export const TablePagination: FunctionComponent<TablePagination> = ({
  page,
  perPage = 10,
  itemCount,
  variant,
  isCompact,
  paginationTitle,
}) => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { t } = useTranslation();

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
        titles={{
          paginationTitle,
          itemsPerPage: t('items_per_page'),
          perPageSuffix: t('per_page_suffix'),
          toFirstPage: t('to_first_page'),
          toPreviousPage: t('to_previous_page'),
          toLastPage: t('to_last_page'),
          toNextPage: t('to_next_page'),
          optionsToggle: t('options_toggle'),
          currPage: t('curr_page'),
        }}
      />
    );
  }
  return null;
};
