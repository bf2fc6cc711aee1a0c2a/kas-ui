import React from 'react';
import {
  ToolbarContent,
  Toolbar,
  ToolbarProps,
  ToolbarItemProps as PFToolbarItemProps,
  ToolbarToggleGroup,
  ToolbarItem,
  ToolbarToggleGroupProps,
} from '@patternfly/react-core';

export type ToolbarItemProps = Omit<PFToolbarItemProps, 'children'> & {
  item: JSX.Element;
};
export type MASToolbarProps = {
  toolbarProps: Omit<ToolbarProps, 'children' | 'ref'>;
  toggleGroupProps?: Omit<ToolbarToggleGroupProps, 'children'>;
  toggleGroupItems?: any;
  toolbarItems?: ToolbarItemProps[];
};

const MASToolbar: React.FunctionComponent<MASToolbarProps> = ({
  toolbarProps,
  toggleGroupProps,
  toolbarItems,
  toggleGroupItems,
}) => {
  const { id, clearAllFilters, collapseListedFiltersBreakpoint = 'md', inset, ...restToolbarProps } = toolbarProps;

  return (
    <>
      <Toolbar
        id={id}
        clearAllFilters={clearAllFilters}
        inset={inset}
        collapseListedFiltersBreakpoint={collapseListedFiltersBreakpoint}
        {...restToolbarProps}
      >
        <ToolbarContent>
          { toggleGroupProps && (
            <ToolbarToggleGroup toggleIcon={toggleGroupProps.toggleIcon} breakpoint='md' {...toggleGroupProps}>
              {toggleGroupItems}
            </ToolbarToggleGroup>
          )}
          {toolbarItems?.map((toolbarItem, index) => {
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
      </Toolbar>
    </>
  );
};

export { MASToolbar };
