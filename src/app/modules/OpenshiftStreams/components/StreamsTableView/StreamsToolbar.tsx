import React, { useState, useRef, useEffect } from 'react';
import {
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
  Select,
  SelectVariant,
  SelectOption,
  ToolbarGroup,
  SelectOptionObject,
  ToolbarChip,
  ValidatedOptions,
  Tooltip,
  ToolbarFilter,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import { MASPagination, MASToolbar, ToolbarItemProps, useRootModalContext, MODAL_TYPES } from '@app/common';
import { useTranslation } from 'react-i18next';
import { FilterType, FilterValue } from './StreamsTableView';
import { cloudProviderOptions, cloudRegionOptions, statusOptions, MAX_FILTER_LIMIT, InstanceStatus } from '@app/utils';
import { CloudProvider } from '../../../../../openapi';
import './StreamsToolbar.css';

/**
 * Todo: remove props isDisabledCreateButton, buttonTooltipContent and labelWithTooltip after summit
 */
export type StreamsToolbarProps = {
  mainToggle: boolean;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
  isDisabledCreateButton?: boolean;
  buttonTooltipContent?: string | undefined;
  labelWithTooltip?: React.ReactNode;
  onCreate?: () => void;
  refresh?: () => void;
  cloudProviders?: Array<CloudProvider>;
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  setFilterSelected,
  filterSelected = 'name',
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue,
  isDisabledCreateButton,
  buttonTooltipContent,
  labelWithTooltip,
  onCreate,
  refresh,
  cloudProviders,
}) => {
  const { t } = useTranslation();
  const { showModal } = useRootModalContext();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [nameInputValue, setNameInputValue] = useState<string | undefined>();
  const [ownerInputValue, setOwnerInputValue] = useState<string | undefined>();
  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [isOwnerValid, setIsOwnerValid] = useState<boolean>(true);
  const [isMaxFilter, setIsMaxFilter] = useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement>();
  const ownerInputRef = useRef<HTMLInputElement>();

  // Options for server-side filtering
  const mainFilterOptions = [
    { label: t('name'), value: 'name', disabled: false },
    { label: t('cloud_provider'), value: 'cloud_provider', disabled: false },
    { label: t('region'), value: 'region', disabled: false },
    { label: t('owner'), value: 'owner', disabled: false },
    { label: t('status'), value: 'status', disabled: false },
  ];

  useEffect(() => {
    handleMaxFilters();
  }, [filteredValue]);

  const cloudProviderFilterOptions = cloudProviderOptions.map((cloudProvider) => {
    return { label: t(cloudProvider.value), value: cloudProvider.value, disabled: false };
  });

  const regionFilterOptions = cloudRegionOptions.map((region) => {
    return { label: t(region.value), value: region.value, disabled: false };
  });

  const statusFilterOptions = statusOptions
    .filter((s) => s.value !== InstanceStatus.PREPARING && s.value !== InstanceStatus.DELETED)
    .map((status) => {
      return { label: t(status.value), value: status.value, disabled: false };
    });

    const cloudProviderFilterOptions = cloudProviderOptions.map((cloudProvider) => {
      return { label: t(cloudProvider.value), value: cloudProvider.value, disabled: false };
    });
  
    const regionFilterOptions = cloudRegionOptions.map((region) => {
      return { label: t(region.value), value: region.value, disabled: false };
    });
  
    const statusFilterOptions = statusOptions
      .filter((s) => s.value !== InstanceStatus.PREPARING && s.value !== InstanceStatus.DELETED)
      .map((status) => {
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
    setIsMaxFilter(false);
  };

  const updateFilter = (key: string, filter: FilterValue, removeIfPresent: boolean) => {
    const newFilterValue: FilterType[] = Object.assign([], filteredValue); // a copy for applied filter
    const filterIndex = newFilterValue.findIndex((f) => f.filterKey === key); // index of current key in applied filter
    if (filterIndex > -1) {
      // if filter is present with the current key
      const filterValue = newFilterValue[filterIndex];
      if (filterValue.filterValue && filterValue.filterValue.length > 0) {
        // if some filters are already there in applied filter for same key
        const filterValueIndex = filterValue.filterValue.findIndex((f) => f.value === filter.value); // index of current filter value in applied filter
        if (filterValueIndex > -1) {
          // filter value is already present
          if (removeIfPresent) {
            filterValue.filterValue.splice(filterValueIndex, 1); // remove the value
          } else {
            return; // skip the duplicate values
          }
        } else {
          // add the filter value to the current applied filter
          newFilterValue[filterIndex].filterValue.push(filter);
        }
      } else {
        // add the filter value to current applied filter
        newFilterValue[filterIndex].filterValue = [filter];
      }
    } else {
      // add filter with key and value to the applied filter
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
    if (event.key === 'Enter' && !isMaxFilter) {
      const fieldName = event?.target?.name;
      onFilter(fieldName);
    }
  };

  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue.filter((filter) => filter.filterKey === key);
    if (selectedFilters.length > 0) {
      return selectedFilters[0].filterValue.map((val) => val.value);
    }
    return;
  };

  const onDeleteChip = (category: string, chip: string | ToolbarChip, filterOptions?: Array<any>) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex((filter) => filter.filterKey === category);
    const prevFilterValue: FilterValue[] = Object.assign([], newFilteredValue[filterIndex]?.filterValue);
    let filterChip: string | undefined = chip.toString();
    /**
     * Filter chip from filter options
     */
    if (filterOptions && filterOptions?.length > 0) {
      filterChip = filterOptions?.find((option) => option.label === chip.toString())?.value;
    }
    /**
     * Delete selected chip from filter options
     */
    const chipIndex = prevFilterValue.findIndex((val) => val.value === filterChip);
    if (chipIndex >= 0) {
      newFilteredValue[filterIndex].filterValue.splice(chipIndex, 1);
      setFilteredValue(newFilteredValue);
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

  const handleMaxFilters = () => {
    let maxFilterCount = 0;
    filteredValue?.forEach((filter: any) => {
      const { filterValue, filterKey } = filter;
      const provisioningStatus =
        filterKey === 'status' && filterValue?.filter(({ value }) => value === InstanceStatus.PROVISIONING);
      const deprovisionStatus =
        filterKey === 'status' && filterValue?.filter(({ value }) => value === InstanceStatus.DEPROVISION);

      if (provisioningStatus?.length > 0 && deprovisionStatus?.length > 0) {
        maxFilterCount += filterValue?.length + 2;
      } else if (provisioningStatus?.length > 0 || deprovisionStatus?.length > 0) {
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

  const isDisabledSelectOption = (key: string, optionValue: string) => {
    let newFilterValue: FilterValue | undefined;
    const newFilteredValue = filteredValue?.filter(({ filterKey }) => filterKey === key);
    if (newFilteredValue && newFilteredValue?.length > 0) {
      const { filterValue } = newFilteredValue[0];
      newFilterValue = filterValue?.find(({ value }) => value === optionValue);
    }
    if (!newFilterValue) {
      return true;
    }
    return false;
  };

  const tooltipContent = (fieldName?: string) => {
    if (isMaxFilter) {
      return <div>{t('max_filter_message')}</div>;
    }
    return <div>{t('input_field_invalid_message', { name: fieldName })}</div>;
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <Select
          variant={SelectVariant.single}
          aria-label="Select filter"
          onToggle={onFilterToggle}
          selections={filterSelected}
          isOpen={isFilterExpanded}
          onSelect={onChangeSelect}
        >
          {mainFilterOptions.map((option, index) => (
            <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </Select>
        <ToolbarFilter
          chips={getSelectionForFilter('name')}
          deleteChip={(_category, chip) => onDeleteChip('name', chip)}
          deleteChipGroup={() => onDeleteChipGroup('name')}
          categoryName={t('name')}
          showToolbarItem={filterSelected?.toLowerCase() === 'name'}
        >
          {filterSelected?.toLowerCase() === 'name' && (
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="name"
                id="filterText"
                type="search"
                aria-label="Search filter input"
                validated={!isNameValid || isMaxFilter ? ValidatedOptions.error : ValidatedOptions.default}
                placeholder={t('filter_by_name_lower')}
                onChange={onNameInputChange}
                onKeyPress={onInputPress}
                value={nameInputValue}
                ref={nameInputRef as React.RefObject<HTMLInputElement>}
              />
              <Button
                variant={ButtonVariant.control}
                isDisabled={!isNameValid || isMaxFilter}
                onClick={() => onFilter('name')}
                aria-label="Search instances"
              >
                <SearchIcon />
              </Button>
              {(!isNameValid || isMaxFilter) && (
                <Tooltip
                  isVisible={isMaxFilter || !isNameValid}
                  content={tooltipContent('name')}
                  reference={nameInputRef}
                />
              )}
            </InputGroup>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('cloud_provider')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('cloud_provider', chip, cloudProviderFilterOptions)}
          deleteChipGroup={() => onDeleteChipGroup('cloud_provider')}
          categoryName={t('cloud_provider')}
          showToolbarItem={filterSelected === 'cloud_provider'}
        >
          {filterSelected === 'cloud_provider' && (
            <Select
              id="cloud-provider-select"
              variant={SelectVariant.checkbox}
              aria-label="Select cloud provider"
              onToggle={onCloudProviderFilterToggle}
              selections={getSelectionForFilter('cloud_provider')}
              isOpen={isCloudProviderFilterExpanded}
              onSelect={onCloudProviderFilterSelect}
              placeholderText={t('filter_by_cloud_provider')}
              className="select-custom-width"
            >
              {cloudProviderFilterOptions.map((option, index) => (
                <SelectOption
                  isDisabled={
                    option.disabled || (isMaxFilter && isDisabledSelectOption('cloud_provider', option.value))
                  }
                  key={index}
                  value={option.value}
                >
                  {isMaxFilter && (
                    <Tooltip
                      isVisible={isMaxFilter}
                      content={tooltipContent()}
                      reference={() => document.getElementById('cloud-provider-select')}
                    />
                  )}
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('region')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('region', chip, regionFilterOptions)}
          deleteChipGroup={() => onDeleteChipGroup('region')}
          categoryName={t('region')}
          showToolbarItem={filterSelected === 'region'}
        >
          {filterSelected === 'region' && (
            <Select
              id="region-select"
              variant={SelectVariant.checkbox}
              aria-label="Select region"
              onToggle={onRegionFilterToggle}
              selections={getSelectionForFilter('region')}
              isOpen={isRegionFilterExpanded}
              onSelect={onRegionFilterSelect}
              placeholderText={t('filter_by_region')}
              className="select-custom-width"
            >
              {regionFilterOptions.map((option, index) => (
                <SelectOption
                  isDisabled={option.disabled || (isMaxFilter && isDisabledSelectOption('region', option.value))}
                  key={index}
                  value={option.value}
                >
                  {isMaxFilter && (
                    <Tooltip
                      isVisible={isMaxFilter}
                      content={tooltipContent()}
                      reference={() => document.getElementById('region-select')}
                    />
                  )}
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('owner')}
          deleteChip={(_category, chip) => onDeleteChip('owner', chip)}
          deleteChipGroup={() => onDeleteChipGroup('owner')}
          categoryName={t('owner')}
          showToolbarItem={filterSelected?.toLowerCase() === 'owner'}
        >
          {filterSelected.toLowerCase() === 'owner' && (
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="owner"
                id="filterOwners"
                type="search"
                aria-label="Search filter input"
                placeholder={t('filter_by_owner')}
                validated={!isOwnerValid || isMaxFilter ? ValidatedOptions.error : ValidatedOptions.default}
                onChange={onOwnerInputChange}
                onKeyPress={onInputPress}
                value={ownerInputValue}
                ref={ownerInputRef as React.RefObject<HTMLInputElement>}
              />
              <Button
                isDisabled={!isOwnerValid || isMaxFilter}
                variant={ButtonVariant.control}
                onClick={() => onFilter('owner')}
                aria-label="Search owners"
              >
                <SearchIcon />
              </Button>
              {(!isOwnerValid || isMaxFilter) && (
                <Tooltip
                  isVisible={isMaxFilter || !isOwnerValid}
                  content={tooltipContent('owner')}
                  reference={ownerInputRef}
                />
              )}
            </InputGroup>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('status')?.map((val) => t(val))}
          deleteChip={(_category, chip) => onDeleteChip('status', chip, statusFilterOptions)}
          deleteChipGroup={() => onDeleteChipGroup('status')}
          categoryName={t('status')}
          showToolbarItem={filterSelected === 'status'}
        >
          {filterSelected === 'status' && (
            <Select
              id="status-select"
              variant={SelectVariant.checkbox}
              aria-label="Select status"
              onToggle={onStatusFilterToggle}
              selections={getSelectionForFilter('status')}
              isOpen={isStatusFilterExpanded}
              onSelect={onStatusFilterSelect}
              placeholderText={t('filter_by_status')}
              className="select-custom-width"
            >
              {statusFilterOptions.map((option, index) => (
                <SelectOption
                  isDisabled={option.disabled || (isMaxFilter && isDisabledSelectOption('status', option.value))}
                  key={index}
                  value={option.value}
                >
                  {isMaxFilter && (
                    <Tooltip
                      isVisible={isMaxFilter}
                      content={tooltipContent()}
                      reference={() => document.getElementById('status-select')}
                    />
                  )}
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          )}
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );

  const handleCreateModal = () => {
    showModal(MODAL_TYPES.CREATE_KAFKA_INSTANCE, {
      onCreate,
      cloudProviders,
      refresh,
    });
  };

  const createButton = () => {
    if (isDisabledCreateButton) {
      return (
        <Tooltip content={buttonTooltipContent}>
          <Button
            variant="primary"
            onClick={handleCreateModal}
            data-testid={'tableStreams-buttonCreateKafka'}
            isAriaDisabled={isDisabledCreateButton}
          >
            {t('create_kafka_instance')}
          </Button>
        </Tooltip>
      );
    }

    return (
      <Button variant="primary" onClick={handleCreateModal} data-testid={'tableStreams-buttonCreateKafka'}>
        {t('create_kafka_instance')}
      </Button>
    );
  };

  const toolbarItems: ToolbarItemProps[] = [
    {
      item: <>{createButton()}</>,
    },
    {
      item: <>{labelWithTooltip}</>,
    },
  ];

  if (total && total > 0 && toolbarItems.length > 1) {
    toolbarItems.push({
      item: (
        <MASPagination
          widgetId="pagination-options-menu-top"
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
      toggleGroupItems={toggleGroupItems}
      toolbarItems={toolbarItems}
    />
  );
};

export { StreamsToolbar };
