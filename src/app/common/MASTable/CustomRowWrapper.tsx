import React, { createContext, useContext } from 'react';
import { InstanceStatus } from '@app/utils';
import { css } from '@patternfly/react-styles';
import './CustomRowWrapper.css';

export type CustomRowWrapperContextProps = {
  activeRow?: string;
  onRowClick?: (event: any, rowIndex: number, row: any) => void;
  rowDataTestId?: string;
  loggedInUser: string | undefined;
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
  const isRowDeleted = originalData?.status === InstanceStatus.DEPROVISION;
  const isRowDisabled = isRowDeleted || loggedInUser !== originalData?.owner;

  return (
    <tr
      data-testid={rowDataTestId}
      tabIndex={!isRowDisabled ? 0 : undefined}
      ref={trRef}
      className={css(
        className,
        'pf-c-table-row__item',
        isRowDisabled ? 'pf-m-disabled' : 'pf-m-selectable',
        !isRowDisabled && activeRow && activeRow === originalData?.name && 'pf-m-selected'
      )}
      hidden={isExpanded !== undefined && !isExpanded}
      onClick={(event: any) => !isRowDisabled && onRowClick && onRowClick(event, rowIndex, row)}
      {...props}
    />
  );
};
