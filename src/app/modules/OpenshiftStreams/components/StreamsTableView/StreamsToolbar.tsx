import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import { MASPagination, MASToolbar, ToolbarItemProps } from '@app/common';
import { FilterType } from './StreamsTableView';
import { InstanceStatus, MAX_FILTER_LIMIT } from '@app/utils';
import './StreamsToolbar.css';
import { StreamsFilterGroup } from '@app/modules/OpenshiftStreams/components/StreamsTableView/Filters/StreamsFilterGroup';

export type StreamsToolbarProps = {
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
  onCreate?: () => void;
  refresh?: () => void;
  handleCreateInstanceModal?: () => void;
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  setFilterSelected,
  filterSelected = 'name',
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue,
  handleCreateInstanceModal,
}) => {
  const { t } = useTranslation();
  const [isMaxFilter, setIsMaxFilter] = useState<boolean>(false);

  useEffect(() => {
    handleMaxFilters();
  }, [filteredValue]);

  const onClear = () => {
    setFilteredValue([]);
    setIsMaxFilter(false);
  };

  const handleMaxFilters = () => {
    let maxFilterCount = 0;
    filteredValue?.forEach((filter: FilterType) => {
      const { filterValue, filterKey } = filter;
      const provisioningStatus =
        filterKey === 'status'
          ? filterValue?.filter(
              ({ value }) => value === InstanceStatus.PROVISIONING
            )
          : [];
      const deprovisionStatus =
        filterKey === 'status'
          ? filterValue?.filter(
              ({ value }) => value === InstanceStatus.DEPROVISION
            )
          : [];

      if (provisioningStatus?.length > 0 && deprovisionStatus?.length > 0) {
        maxFilterCount += filterValue?.length + 2;
      } else if (
        provisioningStatus?.length > 0 ||
        deprovisionStatus?.length > 0
      ) {
        maxFilterCount += filterValue?.length + 1;
      } else {
        maxFilterCount += filterValue?.length;
      }
    });

    if (maxFilterCount >= MAX_FILTER_LIMIT) {
      setIsMaxFilter(true);
    } else {
      setIsMaxFilter(false);
    }
  };

  const toolbarItems: ToolbarItemProps[] = [
    {
      item: (
        <Button
          variant='primary'
          onClick={handleCreateInstanceModal}
          data-testid={'tableStreams-buttonCreateKafka'}
        >
          {t('create_kafka_instance')}
        </Button>
      ),
    },
  ];

  if (total && total > 0) {
    toolbarItems.push({
      item: (
        <MASPagination
          widgetId='pagination-cloudProviderOptions-menu-top'
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
        <StreamsFilterGroup
          isMaxFilter={isMaxFilter}
          filteredValue={filteredValue}
          setFilteredValue={setFilteredValue}
          setFilterSelected={setFilterSelected}
          filterSelected={filterSelected}
        />
      }
      toolbarItems={toolbarItems}
    />
  );
};

export { StreamsToolbar };
