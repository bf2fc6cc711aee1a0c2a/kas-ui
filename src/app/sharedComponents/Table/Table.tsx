import React, { FunctionComponent } from 'react';
import { TableHeader, Table as PFTable, TableBody, TableProps } from '@patternfly/react-table';

const Table: FunctionComponent<TableProps> = ({
  cells,
  rows,
  actionResolver,
  onSort,
  sortBy,
  'aria-label': ariaLabel,
  variant,
  className,
  rowWrapper,
}) => {
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
    >
      <TableHeader />
      <TableBody />
    </PFTable>
  );
};

export { Table };
