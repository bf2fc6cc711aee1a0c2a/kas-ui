import React from 'react';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import {
  ToolbarContent,
  Toolbar as PFToolbar,
  ToolbarProps as PFToolbarProps,
  ToolbarItemProps as PFToolbarItemProps,
  ToolbarToggleGroup,
  ToolbarItem,
} from '@patternfly/react-core';

export interface ToolbarItemProps extends PFToolbarItemProps {
  item: JSX.Element;
}
interface ToolbarProps extends PFToolbarProps {
  toggleGroupItems: JSX.Element;
  toolbarId: string;
  toggleIcon: React.ComponentClass<SVGIconProps, any>;
  onClearAllFilter: () => void;
  toolbarItems: ToolbarItemProps[];
}
const Toolbar: React.FunctionComponent<ToolbarProps> = ({
  toggleGroupItems,
  toolbarId,
  toggleIcon,
  onClearAllFilter,
  toolbarItems,
  collapseListedFiltersBreakpoint,
  inset,
}) => {
  return (
    <>
      <PFToolbar
        id={toolbarId}
        clearAllFilters={onClearAllFilter}
        inset={inset}
        collapseListedFiltersBreakpoint={collapseListedFiltersBreakpoint}
      >
        <ToolbarContent>
          <ToolbarToggleGroup toggleIcon={toggleIcon} breakpoint="md">
            {toggleGroupItems}
          </ToolbarToggleGroup>
          {toolbarItems.map((item, index) => (
            <ToolbarItem
              key={index}
              variant={item.variant}
              className={item.className}
              id={item.id}
              alignment={item.alignment}
            >
              {item.item}
            </ToolbarItem>
          ))}
        </ToolbarContent>
      </PFToolbar>
    </>
  );
};

export { Toolbar };
