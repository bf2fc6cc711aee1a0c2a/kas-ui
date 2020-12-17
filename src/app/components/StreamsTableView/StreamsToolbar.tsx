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
  ToolbarFilter,
  ToolbarChipGroup,
  ToolbarChip,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { TablePagination } from './TablePagination';
import './StreamsToolbarProps.css';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/constants';

type StreamsToolbarProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: {};
  setFilteredValue: (filteredValue: {}) => void;
  listOfOwners: String[];
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  setFilterSelected,
  filterSelected,
  mainToggle,
  total,
  page,
  perPage,
  filteredValue,
  setFilteredValue,
  listOfOwners
}) => {

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>();
  const { t } = useTranslation();

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

  // options for filter dropdown
  const mainFilterOptions = [
    { value: t('name'), disabled: false },
    { value: t('cloud_provider'), disabled: false },
    { value: t('region'), disabled: false },
    { value: t('owner'), disabled: false },
    { value: t('status'), disabled: false }
  ];

  const cloudProviderFilterOptions = [
    { value: t('aws'), disabled: false }
  ];

  const regionFilterOptions = [
    { value: t('us-east-1'), disabled: false }
  ];

  const statusFilterOptions = [
    { value: t('ready'), disabled: false },
    { value: t('failed'), disabled: false },
    { value: t('creation_in_progress'), disabled: false },
    { value: t('creation_pending'), disabled: false }
  ];

  const onInputChange = (input?: string) => {
    if (input === "") {
      setFilteredValue({...filteredValue, name: ""})
    }

    setInputValue(input);
  };

  const onClear = () => {
    setFilteredValue({});
  };

  const formatTitle = (title: string) => {
    switch (title) {
      case 'name':
        return t(title);
      case 'status':
        return t(title);
      case 'cloud_provider':
        return t(title);
      default:
        return t(title);
    }
  };

  const onDeleteGroup = (category: string | ToolbarChipGroup) => {
    var categoryLower = category.toString().toLowerCase();
    if (categoryLower === 'name') {
      setFilteredValue({...filteredValue, name: ""});
    }
    if (categoryLower === 'status') {
      setFilteredValue({...filteredValue, status: ""});
    }
  };

  const onDelete = (category: string | ToolbarChipGroup, chip: ToolbarChip | string) => {
    var categoryLower = category.toString().toLowerCase();
    if (categoryLower === 'status') {
      setFilteredValue({ ...filteredValue, status: '' })
    }
  };

  const onFilter = () => {
    if (inputValue) {
      setFilteredValue({...filteredValue, name: inputValue});
    }
  };

  const getPlaceholder = () => {
    if (filterSelected) {
      const placeholder = filterSelected?.toLowerCase() + '_lower';
      return t(`filter_by_${placeholder}`);
    }
    return '';
  };

  const onChangeSelect = (event, selection) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection);
  };

  const onCloudProviderFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearStatusSelection();
    setFilteredValue({ ...filteredValue, cloud_provider: selection });
    setIsCloudProviderFilterExpanded(false);
  };

  const onRegionFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearStatusSelection();
    setFilteredValue({ ...filteredValue, region: selection });
    setIsRegionFilterExpanded(false);
  };

  const onStatusFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearStatusSelection();
    setFilteredValue({ ...filteredValue, status: selection });
    // else if (selection === "Failed") {
    //   setFilteredValue({ ...filteredValue, status: 'Failed' });
    // }
    // else if (selection === "creation in progress") {
    //   setFilteredValue({ ...filteredValue, status: 'Creation in progress' });
    // }
    // else if (selection === "creation pending") {
    //   setFilteredValue({ ...filteredValue, status: 'Creation pending' });
    // }
    setIsStatusFilterExpanded(false);
  };

  const clearStatusSelection = () => {
    setFilteredValue({ ...filteredValue, status: "" });
    setIsStatusFilterExpanded(false);
  };

  const deleteChip = (key: string) => {
    if (key === 'name') {
      setFilteredValue({ ...filteredValue, name: '' });
    }
    if (key === 'status') {
      setFilteredValue({ ...filteredValue, status: '' });
    }
  }

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected && t(filterSelected.toLowerCase())}
            isOpen={isFilterExpanded}
            onSelect={onChangeSelect}
          >
            {mainFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
            ))}
          </Select>
          { filterSelected === "Name" &&
            <InputGroup className="filter-text-input">
              <TextInput
                name="filter text input"
                id="filterText"
                type="search"
                aria-label="Search filter input"
                placeholder={getPlaceholder()}
                onChange={onInputChange}
                value={inputValue}
              />
              <Button variant={ButtonVariant.control} onClick={onFilter} aria-label="Search instances">
                <SearchIcon />
              </Button>
            </InputGroup>
          }
          { filterSelected === "cloud provider" &&
              <Select
                variant={SelectVariant.single}
                aria-label="Select cloud provider"
                onToggle={onCloudProviderFilterToggle}
                selections={filteredValue.cloud_provider && filteredValue.cloud_provider}
                isOpen={isCloudProviderFilterExpanded}
                onSelect={onCloudProviderFilterSelect}
                placeholderText="Filter by cloud provider"
              >
                {cloudProviderFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
                ))}
              </Select>
          }
          { filterSelected === "Region" &&
            <Select
              variant={SelectVariant.single}
              aria-label="Select region"
              onToggle={onRegionFilterToggle}
              selections={filteredValue.region && filteredValue.region}
              isOpen={isRegionFilterExpanded}
              onSelect={onRegionFilterSelect}
              placeholderText="Filter by region"
            >
              {regionFilterOptions.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
              ))}
            </Select>
          }
          { filterSelected === "Owner" &&
            <Select
              variant={SelectVariant.single}
              aria-label="Select region"
              onToggle={onRegionFilterToggle}
              selections={filteredValue.region && filteredValue.region}
              isOpen={isRegionFilterExpanded}
              onSelect={onRegionFilterSelect}
              placeholderText="Filter by region"
            >
              {listOfOwners.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
              ))}
            </Select>
          }
          { filterSelected === "Status" &&
              <Select
                variant={SelectVariant.single}
                aria-label="Select status"
                onToggle={onStatusFilterToggle}
                selections={filteredValue.status && filteredValue.status}
                isOpen={isStatusFilterExpanded}
                onSelect={onStatusFilterSelect}
                placeholderText="Filter by status"
              >
                {statusFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
                ))}
              </Select>
            }
      </ToolbarGroup>
    </>
  );

  const toolbarChipGroup = (
    <ToolbarGroup>
      <ChipGroup>
        { Object.keys(filteredValue).map(function(key,index) {
          if (filteredValue[key] !== '') {
            return (
            <Chip key={index} onClick={() => deleteChip(key)}>
              {formatTitle(key)}: {filteredValue[key]}
            </Chip>
            )
          }
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
      <ToolbarContent>
        {toolbarChipGroup}
      </ToolbarContent>
    </Toolbar>
  );
};

export { StreamsToolbar };
