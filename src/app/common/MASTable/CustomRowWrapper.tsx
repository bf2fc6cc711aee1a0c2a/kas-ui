import React, { createContext, LegacyRef, useContext } from 'react';
import { InstanceStatus } from '@app/utils';
import { css } from '@patternfly/react-styles';
import './CustomRowWrapper.css';
import { IRow } from '@patternfly/react-table';

export type CustomRowWrapperContextProps<T> = {
  activeRow?: string;
  onRowClick?: (
    event: React.MouseEvent<T>,
    rowIndex?: number,
    row?: IRow
  ) => void;
  rowDataTestId?: string;
  loggedInUser?: string;
};

const CustomRowWrapperContext = createContext<
  CustomRowWrapperContextProps<any>
>({
  activeRow: '',
  onRowClick: () => {
    // No-op
  },
  loggedInUser: '',
});

export const CustomRowWrapperProvider = CustomRowWrapperContext.Provider;

export const CustomRowWrapper = (rowWrapperProps): JSX.Element => {
  const { activeRow, onRowClick, rowDataTestId, loggedInUser } = useContext(
    CustomRowWrapperContext
  );
  const { trRef, className, rowProps, row, ...props } = rowWrapperProps || {};
  const isRowDeleted =
    row?.originalData?.status === InstanceStatus.DEPROVISION ||
    row?.originalData?.status === InstanceStatus.DELETED;
  const isLoggedInUserOwner = loggedInUser === row?.originalData?.owner;
  const isRowDisabled = isRowDeleted || !isLoggedInUserOwner;

  const ref =
    trRef === undefined ? undefined : (trRef as LegacyRef<HTMLTableRowElement>);

  return (
    <tr
      data-testid={rowDataTestId}
      tabIndex={!isRowDisabled ? 0 : undefined}
      ref={ref}
      className={css(
        className,
        'pf-c-table-row__item',
        isRowDeleted
          ? 'pf-m-disabled'
          : isLoggedInUserOwner && 'pf-m-selectable',
        !isRowDisabled &&
          activeRow &&
          activeRow === row?.originalData?.name &&
          'pf-m-selected'
      )}
      hidden={row?.isExpanded !== undefined && !row?.isExpanded}
      onClick={(event) =>
        !isRowDisabled &&
        onRowClick &&
        onRowClick(event, rowProps?.rowIndex, row)
      }
      {...props}
    />
  );
};
