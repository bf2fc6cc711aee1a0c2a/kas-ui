import React, { createContext, useContext } from 'react';
import { InstanceStatus } from '@app/utils';
import { css } from '@patternfly/react-styles';

type CustomRowWrapperContextProps = {
  activeRow: string;
  onRowClick: (event: any, rowIndex: number, row: any) => void;
};

const CustomRowWrapperContext = createContext<CustomRowWrapperContextProps>({
  activeRow: '',
  onRowClick: () => {},
});

export const CustomRowWrapperProvider = CustomRowWrapperContext.Provider;

export const CustomRowWrapper = (rowWrapperProps) => {
  const { activeRow, onRowClick } = useContext(CustomRowWrapperContext);
  const { trRef, className, rowProps, row, ...props } = rowWrapperProps || {};
  const { rowIndex } = rowProps;
  const { isExpanded, originalData } = row;
  const isRowDeleted = originalData?.status === InstanceStatus.DEPROVISION;

  return (
    <tr
      ref={trRef}
      className={css(
        className,
        'pf-c-table-row__item',
        isRowDeleted ? 'pf-m-disabled' : 'pf-m-selectable',
        activeRow === originalData?.name && 'pf-m-selected'
      )}
      hidden={isExpanded !== undefined && !isExpanded}
      onClick={(event: any) => !isRowDeleted && onRowClick(event, rowIndex, row)}
      {...props}
    />
  );
};
