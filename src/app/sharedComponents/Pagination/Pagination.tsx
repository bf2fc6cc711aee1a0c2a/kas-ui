import React, { useCallback, FunctionComponent } from 'react';
import { useHistory, useLocation } from 'react-router';
import {
  Pagination as PFPagination,
  PaginationProps as PFPaginationProps,
  PaginationTitles as PFPaginationTitles,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface PaginationProps extends PFPaginationProps, Pick<PFPaginationTitles, 'paginationTitle'> {
  perPageSuffix?: string;
  toFirstPage?: string;
  toPreviousPage?: string;
  toLastPage?: string;
  toNextPage?: string;
  optionsToggle?: string;
  currPage?: string;
}

const Pagination: FunctionComponent<PaginationProps> = ({
  page,
  perPage = 10,
  itemCount,
  variant,
  isCompact,
  paginationTitle,
  perPageSuffix,
  toFirstPage,
  toPreviousPage,
  toLastPage,
  toNextPage,
  optionsToggle,
  currPage,
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
      <PFPagination
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        variant={variant || 'top'}
        onPerPageSelect={onPerPageSelect}
        isCompact={isCompact}
        titles={{
          paginationTitle,
          perPageSuffix: perPageSuffix || t('per_page_suffix'),
          toFirstPage: toFirstPage || t('to_first_page'),
          toPreviousPage: toPreviousPage || t('to_previous_page'),
          toLastPage: toLastPage || t('to_last_page'),
          toNextPage: toNextPage || t('to_next_page'),
          optionsToggle: optionsToggle || t('options_toggle'),
          currPage: currPage || t('curr_page'),
        }}
      />
    );
  }
  return null;
};


export {Pagination};