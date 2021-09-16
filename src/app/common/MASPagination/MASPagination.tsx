import React, { useCallback, FunctionComponent, createContext, useContext, useState } from 'react';
import {
  Pagination as PFPagination,
  PaginationProps as PFPaginationProps,
  PaginationVariant,
} from '@patternfly/react-core';

export type PaginationProps = Omit<PFPaginationProps, 'children' | 'ref'>;

export type PaginationContextProps = {
  page: number | undefined;
  perPage: number | undefined;
  setPage: (page: number | undefined) => void;
  setPerPage: (perPage: number | undefined) => void;
};

export const PaginationContext = createContext<PaginationContextProps | undefined>(undefined);
export const usePagination = (): PaginationContextProps | undefined => useContext(PaginationContext);

export const PaginationProvider: React.FC = ({ children }) => {
  const [page, setPage] = useState<number | undefined>(1);
  const [perPage, setPerPage] = useState<number | undefined>(10);

  return (
    <PaginationContext.Provider value={{ page, perPage, setPage, setPerPage }}>{children}</PaginationContext.Provider>
  );
};

const MASPagination: FunctionComponent<PaginationProps> = ({
  itemCount,
  variant = PaginationVariant.top,
  isCompact,
  titles,
  ...restProps
}) => {
  const { setPage, setPerPage, perPage, page } = usePagination() || {};

  const onSetPage = useCallback((_: unknown, newPage: number) => {
    setPage && setPage(newPage);
  }, []);

  const onPerPageSelect = useCallback((_: unknown, newPerPage: number) => {
    setPage && setPage(1);
    setPerPage && setPerPage(newPerPage);
  }, []);

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
