import { ReactNode, ReactElement } from "react";
import {
  HeaderProps,
  Table as PFTable,
  TableBody,
  TableBodyProps,
  TableHeader,
  TableProps as PFTableProps,
} from "@patternfly/react-table";
import { css } from "@patternfly/react-styles";
import {
  CustomRowWrapper,
  CustomRowWrapperContextProps,
  CustomRowWrapperProvider,
} from "./CustomRowWrapper";

export type MASTableProps = CustomRowWrapperContextProps & {
  tableProps: Omit<PFTableProps, "children"> & {
    hasDefaultCustomRowWrapper?: boolean;
    ouiaId?: string;
  };
  tableHeaderProps?: Omit<HeaderProps, "children">;
  tableBodyProps?: Omit<TableBodyProps, "children">;
  children?: ReactNode;
};

const MASTable = ({
  tableProps,
  tableHeaderProps,
  tableBodyProps,
  children,
  activeRow,
  onRowClick,
  rowDataTestId,
  loggedInUser,
}: MASTableProps): ReactElement => {
  const {
    cells,
    rows,
    actionResolver,
    onSort,
    sortBy,
    "aria-label": ariaLabel,
    variant,
    className,
    hasDefaultCustomRowWrapper = false,
    ouiaId,
    ...restProps
  } = tableProps;

  /**
   * Handle CustomRowWrapper
   */
  if (hasDefaultCustomRowWrapper) {
    restProps.rowWrapper = CustomRowWrapper;
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
          hasDefaultCustomRowWrapper && "mas--streams-table-view__table",
          className
        )}
        cells={cells}
        variant={variant}
        rows={rows}
        aria-label={ariaLabel}
        actionResolver={actionResolver}
        onSort={onSort}
        sortBy={sortBy}
        ouiaId={ouiaId}
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
