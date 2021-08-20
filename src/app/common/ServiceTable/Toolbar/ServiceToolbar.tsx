import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import { MASPagination, MASToolbar, ToolbarItemProps } from '@app/common';
import './ServiceToolbar.css';
import { ToggleGroupItems } from '@app/common/ServiceTable/Toolbar/ToggleGroupItems';
import { ServiceTableConfig } from '@app/modules/KasTable/config';
import { PaginationProps } from '@app/common/ServiceTable/Toolbar/pagination';
import { FilterTypes } from '@app/common/ServiceTable/Toolbar/Filter';

/**
 * Todo: remove props isDisabledCreateButton, buttonTooltipContent and labelWithTooltip after summit
 */
export type ServiceToolbarProps = PaginationProps & {
  filter: FilterTypes;
  setFilter: React.Dispatch<React.SetStateAction<FilterTypes>>;
  isDisabledCreateButton?: boolean;
  buttonTooltipContent?: string | undefined;
  labelWithTooltip?: ReactElement | undefined;
  openCreateModal: () => Promise<void>;
  config: ServiceTableConfig;
};

const ServiceToolbar: React.FunctionComponent<ServiceToolbarProps> = ({
  total,
  filter,
  setFilter,
  isDisabledCreateButton,
  buttonTooltipContent,
  labelWithTooltip,
  openCreateModal,
  config,
  perPage,
  page,
}) => {
  const { t } = useTranslation(config.id);

  const [isMaxFilter, setIsMaxFilter] = useState<boolean>(false);
  const [filterSelected, setFilterSelected] = useState(
    config.filters.defaultFilter
  );

  const onClear = () => {
    setFilter({});
    setIsMaxFilter(false);
  };

  const handleCreateModal = async () => {
    await openCreateModal();
  };

  const createButton = () => {
    if (isDisabledCreateButton) {
      return (
        <Tooltip content={buttonTooltipContent}>
          <Button
            variant='primary'
            onClick={handleCreateModal}
            data-testid={`${config.id}-serviceTable-createButton`}
            isAriaDisabled={isDisabledCreateButton}
          >
            {t('create_instance')}
          </Button>
        </Tooltip>
      );
    }
    return (
      <Button
        variant='primary'
        onClick={handleCreateModal}
        data-testid={`${config.id}-serviceTable-createButton`}
      >
        {t('create_instance')}
      </Button>
    );
  };

  const toolbarItems: ToolbarItemProps[] = [
    {
      item: createButton(),
    },
    {
      item: labelWithTooltip,
    },
  ];

  if (total && total > 0) {
    toolbarItems.push({
      item: (
        <MASPagination
          widgetId='pagination-options-menu-top'
          itemCount={total}
          page={page}
          perPage={perPage}
          isCompact={true}
          titles={{
            paginationTitle: t('minimal_pagination'),
            perPageSuffix: t('per_page_suffix'),
            toFirstPage: t('to_first_page'),
            toPreviousPage: t('to_previous_page'),
            toLastPage: t('to_last_page'),
            toNextPage: t('to_next_page'),
            optionsToggle: t('options_toggle'),
            currPage: t('curr_page'),
          }}
        />
      ),
      variant: 'pagination',
      alignment: { default: 'alignRight' },
    });
  }

  return (
    <MASToolbar
      toolbarProps={{
        id: 'instance-toolbar',
        clearAllFilters: onClear,
        collapseListedFiltersBreakpoint: 'md',
        inset: { xl: 'insetLg' },
      }}
      toggleGroupProps={{ toggleIcon: <FilterIcon />, breakpoint: 'md' }}
      toggleGroupItems={
        <ToggleGroupItems
          filterSelected={filterSelected}
          setFilterSelected={setFilterSelected}
          filter={filter}
          setFilter={setFilter}
          isMaxFilter={isMaxFilter}
          setIsMaxFilter={setIsMaxFilter}
          config={config}
        />
      }
      toolbarItems={toolbarItems}
    />
  );
};

export { ServiceToolbar };
