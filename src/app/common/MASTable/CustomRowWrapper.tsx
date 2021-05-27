import React, { createContext, useContext } from 'react';
import { InstanceStatus } from '@app/utils';
import { css } from '@patternfly/react-styles';
import './CustomRowWrapper.css';

export type CustomRowWrapperContextProps = {
  activeRow?: string;
  onRowClick?: (event: MouseEvent, rowIndex: number, row: any) => void;
  rowDataTestId?: string;
  loggedInUser?: string;
};

const CustomRowWrapperContext = createContext<CustomRowWrapperContextProps>({
  activeRow: '',
  onRowClick: () => {},
  loggedInUser: '',
});

export const CustomRowWrapperProvider = CustomRowWrapperContext.Provider;

export const CustomRowWrapper = (rowWrapperProps) => {
  const { activeRow, onRowClick, rowDataTestId, loggedInUser } = useContext(CustomRowWrapperContext);
  const { trRef, className, rowProps, row, ...props } = rowWrapperProps || {};
  const { rowIndex } = rowProps;
  const { isExpanded, originalData } = row;
  const isRowDeleted =
    originalData?.status === InstanceStatus.DEPROVISION || originalData?.status === InstanceStatus.DELETED;
  const isLoggedInUserOwner = loggedInUser === originalData?.owner;
  const isRowDisabled = isRowDeleted || !isLoggedInUserOwner;

  return (
    <tr
      data-testid={rowDataTestId}
      tabIndex={!isRowDisabled ? 0 : undefined}
      ref={trRef}
      className={css(
        className,
        'pf-c-table-row__item',
        isRowDeleted ? 'pf-m-disabled' : isLoggedInUserOwner && 'pf-m-selectable',
        !isRowDisabled && activeRow && activeRow === originalData?.name && 'pf-m-selected'
      )}
      hidden={isExpanded !== undefined && !isExpanded}
      onClick={(event: MouseEvent) => !isRowDisabled && onRowClick && onRowClick(event, rowIndex, row)}
      {...props}
    />
  );
};
