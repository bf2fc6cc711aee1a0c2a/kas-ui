import React, { FunctionComponent } from 'react';
import {
  TableHeader,
  Table as PFTable,
  TableBody,
  TableProps as PFTableProps,
  HeaderProps,
  TableBodyProps,
} from '@patternfly/react-table';

export interface MKTableProps {
  tableProps: Omit<PFTableProps, 'children'>;
  tableHeaderProps?: Omit<HeaderProps, 'children'>;
  tableBodyProps?: Omit<TableBodyProps, 'children'>;
  children?: React.ReactNode;
}

const Table: FunctionComponent<MKTableProps> = ({ tableProps, tableHeaderProps, tableBodyProps, children }) => {
  const {
    cells,
    rows,
    actionResolver,
    onSort,
    sortBy,
    'aria-label': ariaLabel,
    variant,
    className,
    rowWrapper,
    ...restProps
  } = tableProps;

  return (
    <PFTable
      className={className}
      rowWrapper={rowWrapper}
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
  );
};

export { Table };
