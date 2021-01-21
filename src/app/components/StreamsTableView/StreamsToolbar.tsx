import React, { useState, useRef } from 'react';
import {
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
  ToolbarChip,
  ValidatedOptions,
  Tooltip,
  ToolbarFilter
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { TablePagination } from './TablePagination';
import { useTranslation } from 'react-i18next';
import { FilterType, FilterValue } from './StreamsTableView';
import { cloudProviderOptions, cloudRegionOptions, statusOptions } from '@app/utils/utils';
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
  filterSelected = 'name',
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [nameInputValue, setNameInputValue] = useState<string | undefined>();
  const [ownerInputValue, setOwnerInputValue] = useState<string | undefined>();
  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [isOwnerValid, setIsOwnerValid] = useState<boolean>(true);
  const nameInputRef = useRef<HTMLInputElement>();
  const ownerInputRef = useRef<HTMLInputElement>();
  const { t } = useTranslation();

  // Options for server-side filtering
  const mainFilterOptions = [
    { label: t('name'), value: 'name', disabled: false },
    { label: t('cloud_provider'), value: 'cloud_provider', disabled: false },
    { label: t('region'), value: 'region', disabled: false },
    { label: t('owner'), value: 'owner', disabled: false },
    { label: t('status'), value: 'status', disabled: false },
  ];

  const cloudProviderFilterOptions = cloudProviderOptions.map((cloudProvider) => {
    return { label: t(cloudProvider.value), value: cloudProvider.value, disabled: false };
  });

  const regionFilterOptions = cloudRegionOptions.map((region) => {
    return { label: t(region.value), value: region.value, disabled: false };
  });

  const statusFilterOptions = statusOptions.map((status) => {
    return { label: t(status.value), value: status.value, disabled: false };
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
    !isNameValid && setIsNameValid(true);
  };

  const onOwnerInputChange = (input?: string) => {
    setOwnerInputValue(input);
    !isOwnerValid && setIsOwnerValid(true);
  };

  const onClear = () => {
    setFilteredValue([]);
  };

  const updateFilter = (key: string, filter: FilterValue, removeIfPresent: boolean) => {
    const newFilterValue: FilterType[] = Object.assign([], filteredValue); // a copy for applied filter
    const filterIndex = newFilterValue.findIndex((f) => f.filterKey === key); // index of current key in applied filter
    if (filterIndex > -1) { // if filter is present with the current key
      const filterValue = newFilterValue[filterIndex];
      if (filterValue.filterValue && filterValue.filterValue.length > 0) { // if some filters are already there in applied filter for same key
        const filterValueIndex = filterValue.filterValue.findIndex((f) => f.value === filter.value); // index of current filter value in applied filter
        if (filterValueIndex > -1) { // filter value is already present
          if (removeIfPresent) {
            filterValue.filterValue.splice(filterValueIndex, 1); // remove the value
          } else {
            return; // skip the duplicate values
          }
        } else { // add the filter value to the current applied filter 
          newFilterValue[filterIndex].filterValue.push(filter);
        }
      } else { // add the filter value to current applied filter 
        newFilterValue[filterIndex].filterValue = [filter];
      }
    } else { // add filter with key and value to the applied filter
      newFilterValue.push({ filterKey: key, filterValue: [filter] });
    }
    setFilteredValue(newFilterValue);
  };

  const isInputValid = (value?: string) => {
    return value ? /^([a-zA-Z0-9-_%]*[a-zA-Z0-9-_%])?$/.test(value.trim()) : true;
  };

  const onFilter = (filterType: string) => {
    if (filterType === 'name' && nameInputValue && nameInputValue.trim() != '') {
      if (isInputValid(nameInputValue)) {
        updateFilter('name', { value: nameInputValue, isExact: false }, false);
        setNameInputValue('');
      } else {
        setIsNameValid(false);
      }
    } else if (filterType === 'owner' && ownerInputValue && ownerInputValue.trim() != '') {
      if (isInputValid(ownerInputValue)) {
        updateFilter('owner', { value: ownerInputValue, isExact: false }, false);
        setOwnerInputValue('');
      } else {
        setIsOwnerValid(false);
      }
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
    updateFilter('cloud_provider', { value: selection.toString(), isExact: true }, true);
    cloudProviderOptions.length < 2 && setIsCloudProviderFilterExpanded(false);
  };

  const onRegionFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('region');
    updateFilter('region', { value: selection.toString(), isExact: true }, true);
    regionFilterOptions.length < 2 && setIsRegionFilterExpanded(false);
  };

  const onStatusFilterSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clearSelection('status');
    updateFilter('status', { value: selection.toString(), isExact: true }, true);
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
      switch (key) {
        case 'name':
        case 'owner':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'region':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'cloud_provider':
          return selectedFilters[0].filterValue.map((val) => val.value);
        case 'status':
          return selectedFilters[0].filterValue.map((val) => val.value);
        default:
          return [];
      }
    }
    return [];
  };

  const onDeleteChip = (category: string, chip: string | ToolbarChip) => {
    if (category !== 'region' && category !== 'cloud_provider') {
      const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
      const filterIndex = newFilteredValue.findIndex((filter) => filter.filterKey === category);
      const prevFilterValue: FilterValue[] = Object.assign([], newFilteredValue[filterIndex]?.filterValue);
      const chipIndex = filterIndex >= 0 ? prevFilterValue.findIndex((val) => val.value === chip.toString()) : -1;
      if (chipIndex >= 0) {
        newFilteredValue[filterIndex].filterValue.splice(chipIndex, 1);
        setFilteredValue(newFilteredValue);
      }
    }
  };

  const onDeleteChipGroup = (category: string) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex((filter) => filter.filterKey === category);
    if (filterIndex >= 0) {
      newFilteredValue.splice(filterIndex, 1);
      setFilteredValue(newFilteredValue);
    }
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected && filterSelected}
            isOpen={isFilterExpanded}
            onSelect={onChangeSelect}
          >
            {mainFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>
        <ToolbarFilter
          chips={getSelectionForFilter('name')}
          deleteChip={(_category, chip) => onDeleteChip('name', chip)}
          deleteChipGroup={() => onDeleteChipGroup('name')}
          categoryName={t('name')}
        >
          {filterSelected?.toLowerCase() === 'name' && (
            <ToolbarItem>
              <InputGroup className="mk--filter-instances__toolbar--text-input">
                <TextInput
                  name="filter names"
                  id="filterText"
                  type="search"
                  aria-label="Search filter input"
                  validated={!isNameValid ? ValidatedOptions.error : ValidatedOptions.default}
                  placeholder={t('filter_by_name_lower')}
                  onChange={onNameInputChange}
                  onKeyPress={onInputPress}
                  value={nameInputValue}
                  ref={nameInputRef as React.RefObject<HTMLInputElement>}
                />
                <Button
                  variant={ButtonVariant.control}
                  isDisabled={!isNameValid}
                  onClick={() => onFilter('name')}
                  aria-label="Search instances"
                >
                  <SearchIcon />
                </Button>
                {!isNameValid && (
                  <Tooltip
                    content={
                      <div>
                        Valid characters for owner are lowercase letters from a to z, numbers from 0 to 9, underscore
                        (_) hyphens (-) and percentage (%)
                      </div>
                    }
                    reference={nameInputRef}
                  />
                )}
              </InputGroup>
            </ToolbarItem>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('cloud_provider')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('cloud_provider', chip)}
          deleteChipGroup={() => onDeleteChipGroup('cloud_provider')}
          categoryName={t('cloud_provider')}
        >
          {filterSelected === 'cloud_provider' && (
            <ToolbarItem>
              <Select
                variant={SelectVariant.checkbox}
                aria-label="Select cloud provider"
                onToggle={onCloudProviderFilterToggle}
                selections={getSelectionForFilter('cloud_provider')}
                isOpen={isCloudProviderFilterExpanded}
                onSelect={onCloudProviderFilterSelect}
                placeholderText={t('filter_by_cloud_provider')}
              >
                {cloudProviderFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('region')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('region', chip)}
          deleteChipGroup={() => onDeleteChipGroup('region')}
          categoryName={t('region')}
        >
          {filterSelected === 'region' && (
            <ToolbarItem>
              <Select
                variant={SelectVariant.checkbox}
                aria-label="Select region"
                onToggle={onRegionFilterToggle}
                selections={getSelectionForFilter('region')}
                isOpen={isRegionFilterExpanded}
                onSelect={onRegionFilterSelect}
                placeholderText={t('filter_by_region')}
              >
                {regionFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('owner')}
          deleteChip={(_category, chip) => onDeleteChip('owner', chip)}
          deleteChipGroup={() => onDeleteChipGroup('owner')}
          categoryName={t('owner')}
        >
          {filterSelected.toLowerCase() === 'owner' && (
            <ToolbarItem>
              <InputGroup className="mk--filter-instances__toolbar--text-input">
                <TextInput
                  name="filter owners"
                  id="filterOwners"
                  type="search"
                  aria-label="Search filter input"
                  placeholder={t('filter_by_owner')}
                  validated={!isOwnerValid ? ValidatedOptions.error : ValidatedOptions.default}
                  onChange={onOwnerInputChange}
                  onKeyPress={onInputPress}
                  value={ownerInputValue}
                  ref={ownerInputRef as React.RefObject<HTMLInputElement>}
                />
                <Button
                  isDisabled={!isOwnerValid}
                  variant={ButtonVariant.control}
                  onClick={() => onFilter('owner')}
                  aria-label="Search owners"
                >
                  <SearchIcon />
                </Button>
                {!isOwnerValid && (
                  <Tooltip
                    content={
                      <div>
                        Valid characters for owner are lowercase letters from a to z, numbers from 0 to 9, underscore
                        (_) hyphens (-) and percentage (%)
                      </div>
                    }
                    reference={nameInputRef}
                  />
                )}
              </InputGroup>
            </ToolbarItem>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('status')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('status', chip)}
          deleteChipGroup={() => onDeleteChipGroup('status')}
          categoryName={t('status')}
        >
          {filterSelected === 'status' && (
            <ToolbarItem>
              <Select
                variant={SelectVariant.checkbox}
                aria-label="Select status"
                onToggle={onStatusFilterToggle}
                selections={getSelectionForFilter('status')}
                isOpen={isStatusFilterExpanded}
                onSelect={onStatusFilterSelect}
                placeholderText={t('filter_by_status')}
              >
                {statusFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          )}
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );

  return (
    <Toolbar
      id="instance-toolbar"
      clearAllFilters={onClear}
      inset={{ lg: 'insetLg' }}
      collapseListedFiltersBreakpoint="md"
    >
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
    </Toolbar>
  );
};

export { StreamsToolbar };
