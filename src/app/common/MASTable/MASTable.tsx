import React, { ReactElement } from 'react';
import {
  HeaderProps,
  Table as PFTable,
  TableBody,
  TableBodyProps,
  TableHeader,
  TableProps as PFTableProps,
} from '@patternfly/react-table';
import { css } from '@patternfly/react-styles';
import {
  CustomRowWrapper,
  CustomRowWrapperContextProps,
  CustomRowWrapperProvider,
} from './CustomRowWrapper';

export type MASTableProps<T> = CustomRowWrapperContextProps<T> & {
  tableProps: Omit<PFTableProps, 'children'> & {
    hasDefaultCustomRowWrapper?: boolean;
  };
  tableHeaderProps?: Omit<HeaderProps, 'children'>;
  tableBodyProps?: Omit<TableBodyProps, 'children'>;
  children?: React.ReactNode;
};

const MASTable = <T,>({
  tableProps,
  tableHeaderProps,
  tableBodyProps,
  children,
  activeRow,
  onRowClick,
  rowDataTestId,
  loggedInUser,
}: MASTableProps<T>): ReactElement<any, any> => {
  const {
    cells,
    rows,
    actionResolver,
    onSort,
    sortBy,
    'aria-label': ariaLabel,
    variant,
    className,
    hasDefaultCustomRowWrapper = false,
    ...restProps
  } = tableProps;

  /**
   * Handle CustomRowWrapper
   */
  if (hasDefaultCustomRowWrapper) {
    restProps['rowWrapper'] = CustomRowWrapper;
  }

  return (
    <CustomRowWrapperProvider
      value={{
        activeRow,
        onRowClick,
        rowDataTestId,
        loggedInUser,
      }}
    >
      <PFTable
        className={css(
          hasDefaultCustomRowWrapper && 'mas--streams-table-view__table',
          className
        )}
        cells={cells}
        variant={variant}
        rows={rows}
        aria-label={ariaLabel}
        actionResolver={actionResolver}
        onSort={onSort}
        sortBy={sortBy}
        {...restProps}
      >
        <TableHeader {...tableHeaderProps} />
        <TableBody {...tableBodyProps} />
        {children}
      </PFTable>
    </CustomRowWrapperProvider>
  );
};

export { MASTable };
