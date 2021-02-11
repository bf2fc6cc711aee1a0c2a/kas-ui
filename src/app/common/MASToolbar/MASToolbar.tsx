import React from 'react';
import {
  ToolbarContent,
  Toolbar as PFToolbar,
  ToolbarProps as PFToolbarProps,
  ToolbarItemProps as PFToolbarItemProps,
  ToolbarToggleGroup,
  ToolbarItem,
  ToolbarToggleGroupProps,
} from '@patternfly/react-core';

export interface ToolbarItemProps extends Omit<PFToolbarItemProps, 'children'> {
  item: JSX.Element;
}
interface ToolbarProps {
  toolbarProps: Omit<PFToolbarProps, 'children' | 'ref'>;
  toggleGroupProps: Omit<ToolbarToggleGroupProps, 'children'>;
  toggleGroupItems: JSX.Element;
  toolbarItems: ToolbarItemProps[];
}

const MASToolbar: React.FunctionComponent<ToolbarProps> = ({
  toolbarProps,
  toggleGroupProps,
  toolbarItems,
  toggleGroupItems,
}) => {
  const { id, clearAllFilters, collapseListedFiltersBreakpoint = 'md', inset, ...restToolbarProps } = toolbarProps;
  const { toggleIcon, breakpoint = 'md', ...toolbarToggleGroupProps } = toggleGroupProps;
  return (
    <>
      <PFToolbar
        id={id}
        clearAllFilters={clearAllFilters}
        inset={inset}
        collapseListedFiltersBreakpoint={collapseListedFiltersBreakpoint}
        {...restToolbarProps}
      >
        <ToolbarContent>
          <ToolbarToggleGroup toggleIcon={toggleIcon} breakpoint={breakpoint} {...toolbarToggleGroupProps}>
            {toggleGroupItems}
          </ToolbarToggleGroup>
          {toolbarItems.map((toolbarItem, index) => {
            const { key = 'mas', variant, className, id, alignment, item, ...restItemProps } = toolbarItem;
            return (
              <ToolbarItem
                key={`${key}-${index}`}
                variant={variant}
                className={className}
                id={id}
                alignment={alignment}
                {...restItemProps}
              >
                {item}
              </ToolbarItem>
            );
          })}
        </ToolbarContent>
      </PFToolbar>
    </>
  );
};

export { MASToolbar };
