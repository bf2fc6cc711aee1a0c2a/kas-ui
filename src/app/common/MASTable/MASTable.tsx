import React, { FunctionComponent } from 'react';
import {
  TableHeader,
  Table as PFTable,
  TableBody,
  TableProps as PFTableProps,
  HeaderProps,
  TableBodyProps,
} from '@patternfly/react-table';
import { css } from '@patternfly/react-styles';
import { CustomRowWrapper, CustomRowWrapperProvider, CustomRowWrapperContextProps } from './CustomRowWrapper';

export type MASTableProps = CustomRowWrapperContextProps & {
  tableProps: Omit<PFTableProps, 'children'> & {
    hasDefaultCustomRowWrapper?: boolean;
  };
  tableHeaderProps?: Omit<HeaderProps, 'children'>;
  tableBodyProps?: Omit<TableBodyProps, 'children'>;
  children?: React.ReactNode;
};

const MASTable: FunctionComponent<MASTableProps> = ({
  tableProps,
  tableHeaderProps,
  tableBodyProps,
  children,
  activeRow,
  onRowClick,
  rowDataTestId,
  loggedInUser,
}) => {
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
        className={css(hasDefaultCustomRowWrapper && 'mas--streams-table-view__table', className)}
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
