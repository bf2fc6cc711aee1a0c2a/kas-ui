import React, { useState } from 'react';
import {
  ChipGroup,
  Chip,
  ToolbarItem,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
  Select,
  SelectVariant,
  SelectOption,
  ToolbarToggleGroup,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  SelectOptionObject,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { TablePagination } from './TablePagination';
import { useTranslation } from 'react-i18next';
import { FilterType } from './StreamsTableView';
import { cloudProviderOptions, cloudRegionOptions, statusOptions } from '@app/utils/utils';
import { getInitialFilter } from '@app/OpenshiftStreams/OpenshiftStreams';
import './StreamsToolbar.css';

type StreamsToolbarProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  setFilterSelected,
  filterSelected,
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [nameInputValue, setNameInputValue] = useState<string | undefined>();
  const [ownerInputValue, setOwnerInputValue] = useState<string | undefined>();
  const { t } = useTranslation();
  // Options for server-side filtering
  const mainFilterOptions = [
    { value: t('name'), disabled: false },
    { value: t('cloud_provider'), disabled: false },
    { value: t('region'), disabled: false },
    { value: t('owner'), disabled: false },
    { value: t('status'), disabled: false },
  ];

  const cloudProviderFilterOptions = cloudProviderOptions.map((cloudProvider) => {
    return { value: t(cloudProvider.value), disabled: false };
  });

  const regionFilterOptions = cloudRegionOptions.map((region) => {
    return { value: t(region.value), disabled: false };
  });

  const statusFilterOptions = statusOptions.map((status) => {
    return { value: t(status.value), disabled: false };
  });

  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const onCloudProviderFilterToggle = () => {
    setIsCloudProviderFilterExpanded(!isCloudProviderFilterExpanded);
  };

  const onRegionFilterToggle = () => {
    setIsRegionFilterExpanded(!isRegionFilterExpanded);
  };

  const onStatusFilterToggle = () => {
    setIsStatusFilterExpanded(!isStatusFilterExpanded);
  };

  const onNameInputChange = (input?: string) => {
    setNameInputValue(input);
  };

  const onOwnerInputChange = (input?: string) => {
    setOwnerInputValue(input);
  };

  const onClear = () => {
    setFilteredValue(getInitialFilter() as FilterType[]);
  };

  const updateAppliedFilter = (filterKey: string, filterValue?: string) => {
    const copyFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = copyFilteredValue.findIndex((filter) => filter.filterKey === filterKey);
    let toUpdate = true;
    if (filterIndex >= 0) {
      if (copyFilteredValue[filterIndex].filterValue !== filterValue) {
        copyFilteredValue.splice(filterIndex, 1);
      } else {
        toUpdate = false;
      }
    }
    if (toUpdate && filterValue?.trim() !== '') {
      const filter: FilterType = { filterKey, filterValue };
      copyFilteredValue.splice(0, 0, filter);
    }
    toUpdate && setFilteredValue(copyFilteredValue);
  };

  const onFilter = (filterType: string) => {
    if (filterType === 'name' && nameInputValue) {
      updateAppliedFilter('name', nameInputValue);
    } else if (filterType === 'owner' && ownerInputValue) {
      updateAppliedFilter('owner', ownerInputValue);
    }
  };

  const onChangeSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject
  ) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection?.toString());
  };

  const onCloudProviderFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('cloud_provider');
    updateAppliedFilter('cloud_provider', selection.toString());
    setIsCloudProviderFilterExpanded(false);
  };

  const onRegionFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('region');
    updateAppliedFilter('region', selection.toString());
    setIsRegionFilterExpanded(false);
  };

  const onStatusFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('status');
    updateAppliedFilter('status', selection.toString());
    setIsStatusFilterExpanded(false);
  };

  const clearSelection = (value: string) => {
    const copyFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = copyFilteredValue.findIndex((filter) => filter.filterKey === value);
    if (filterIndex >= 0) {
      copyFilteredValue.splice(filterIndex, 1);
    }
    setFilteredValue(copyFilteredValue);
    if (value === 'name') {
      setNameInputValue('');
    }
    if (value === 'owner') {
      setOwnerInputValue('');
    }
    if (value === 'cloud_provider') {
      setIsStatusFilterExpanded(false);
    }
    if (value === 'region') {
      setIsRegionFilterExpanded(false);
    }
    if (value === 'status') {
      setIsStatusFilterExpanded(false);
    }
  };

  const deleteChip = (key: string) => {
    const copyFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = copyFilteredValue.findIndex((filter) => filter.filterKey === key);
    if (key === 'name' && copyFilteredValue[filterIndex].filterValue === nameInputValue?.trim()) {
      setNameInputValue('');
    }
    if (key === 'owner' && copyFilteredValue[filterIndex].filterValue === ownerInputValue?.trim()) {
      setOwnerInputValue('');
    }
    if (filterIndex >= 0) {
      copyFilteredValue.splice(filterIndex, 1);
    }
    setFilteredValue(copyFilteredValue);
  };

  const onInputPress = (event) => {
    if (event.key === 'Enter') {
      if (event?.target?.name === 'filter names') {
        onFilter('name');
      } else if (event.target?.name === 'filter owners') {
        onFilter('owner');
      }
    }
  };

  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue.filter((filter) => filter.filterKey === key);
    if (selectedFilters.length > 0) {
      return selectedFilters[0].filterValue;
    }
    return;
  };
  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <Select
          variant={SelectVariant.single}
          aria-label="Select filter"
          onToggle={onFilterToggle}
          selections={filterSelected && filterSelected}
          isOpen={isFilterExpanded}
          onSelect={onChangeSelect}
        >
          {mainFilterOptions.map((option, index) => (
            <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
          ))}
        </Select>
        {filterSelected === t('name') && (
          <InputGroup className="mk--filter-instances__toolbar--text-input">
            <TextInput
              name="filter names"
              id="filterText"
              type="search"
              aria-label="Search filter input"
              placeholder={t('filter_by_name_lower')}
              onChange={onNameInputChange}
              onKeyPress={onInputPress}
              value={nameInputValue}
            />
            <Button variant={ButtonVariant.control} onClick={() => onFilter('name')} aria-label="Search instances">
              <SearchIcon />
            </Button>
          </InputGroup>
        )}
        {filterSelected === t('cloud_provider') && (
          <Select
            variant={SelectVariant.single}
            aria-label="Select cloud provider"
            onToggle={onCloudProviderFilterToggle}
            selections={getSelectionForFilter('cloud_provider')}
            isOpen={isCloudProviderFilterExpanded}
            onSelect={onCloudProviderFilterSelect}
            placeholderText="Filter by cloud provider"
          >
            {cloudProviderFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
            ))}
          </Select>
        )}
        {filterSelected === t('region') && (
          <Select
            variant={SelectVariant.single}
            aria-label="Select region"
            onToggle={onRegionFilterToggle}
            selections={getSelectionForFilter('region')}
            isOpen={isRegionFilterExpanded}
            onSelect={onRegionFilterSelect}
            placeholderText="Filter by region"
          >
            {regionFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
            ))}
          </Select>
        )}
        {filterSelected === t('owner') && (
          <InputGroup className="mk--filter-instances__toolbar--text-input">
            <TextInput
              name="filter owners"
              id="filterOwners"
              type="search"
              aria-label="Search filter input"
              placeholder={t('filter_by_owner')}
              onChange={onOwnerInputChange}
              onKeyPress={onInputPress}
              value={ownerInputValue}
            />
            <Button variant={ButtonVariant.control} onClick={() => onFilter('owner')} aria-label="Search owners">
              <SearchIcon />
            </Button>
          </InputGroup>
        )}
        {filterSelected === t('status') && (
          <Select
            variant={SelectVariant.single}
            aria-label="Select status"
            onToggle={onStatusFilterToggle}
            selections={getSelectionForFilter('status')}
            isOpen={isStatusFilterExpanded}
            onSelect={onStatusFilterSelect}
            placeholderText="Filter by status"
          >
            {statusFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
            ))}
          </Select>
        )}
      </ToolbarGroup>
    </>
  );

  const toolbarChipGroup = (
    <ToolbarGroup>
      <ChipGroup numChips={5}>
        {filteredValue &&
          filteredValue.map((filter: FilterType, index: number) => {
            if (filter.filterValue && filter.filterValue.trim() != '') {
              if (filter.filterKey === 'region' || filter.filterKey === 'cloud_provider') {
                return (
                  <Chip className="pf-c-chip__text" key={index} onClick={() => deleteChip(filter.filterKey)} isReadOnly>
                    {t(filter.filterKey)}: {filter.filterValue}
                  </Chip>
                );
              } else {
                return (
                  <Chip className="pf-c-chip__text" key={index} onClick={() => deleteChip(filter.filterKey)}>
                    {t(filter.filterKey)}: {filter.filterValue}
                  </Chip>
                );
              }
            } else return <></>;
          })}
      </ChipGroup>
    </ToolbarGroup>
  );

  return (
    <Toolbar id="instance-toolbar" clearAllFilters={onClear} inset={{ lg: 'insetLg' }}>
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
          {toggleGroupItems}
        </ToolbarToggleGroup>
        <ToolbarItem>
          <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
            {t('create_kafka_instance')}
          </Button>
        </ToolbarItem>
        <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
          <TablePagination
            widgetId="pagination-options-menu-top"
            itemCount={total}
            page={page}
            perPage={perPage}
            isCompact={true}
            paginationTitle={t('minimal_pagination')}
          />
        </ToolbarItem>
      </ToolbarContent>
      <ToolbarContent>{toolbarChipGroup}</ToolbarContent>
    </Toolbar>
  );
};

export { StreamsToolbar };
