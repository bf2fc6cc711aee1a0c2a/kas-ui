import React, { useState, useEffect } from 'react';
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
  ToolbarGroup
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { TablePagination } from './TablePagination';
import { useTranslation } from 'react-i18next';
import { cloudProviderOptions, cloudRegionOptions, statusOptions } from '@app/utils/utils';
import './StreamsToolbar.css';
import { SearchInput } from '@patternfly/react-core';

type StreamsToolbarProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: { property: string };
  setFilteredValue: (filteredValue: { property: string }) => void;
  listOfOwners: string[];
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
  listOfOwners
}) => {

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isCloudProviderFilterExpanded, setIsCloudProviderFilterExpanded] = useState(false);
  const [isRegionFilterExpanded, setIsRegionFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [isOwnerFilterExpanded, setIsOwnerFilterExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>();
  const [trimmedFilterValue, setTrimmedFilterValue] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    trimFilterValues();
  }, [filteredValue]);

  // Options for server-side filtering
  const mainFilterOptions = [
    { value: t('name'), disabled: false },
    { value: t('cloud_provider'), disabled: false },
    { value: t('region'), disabled: false },
    { value: t('owner'), disabled: false },
    { value: t('status'), disabled: false }
  ];

  const cloudProviderFilterOptions = cloudProviderOptions.map(cloudProvider => {
    return (
      { value: t(cloudProvider.value), disabled: false }
    )
  });

  const regionFilterOptions = cloudRegionOptions.map(region => {
    return (
      { value: t(region.value), disabled: false }
    )
  });

  const statusFilterOptions = statusOptions.map(status => {
    return (
      { value: t(status.value), disabled: false }
    )
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

  const onOwnerFilterToggle = () => {
    setIsOwnerFilterExpanded(!isOwnerFilterExpanded);
  };

  const onStatusFilterToggle = () => {
    setIsStatusFilterExpanded(!isStatusFilterExpanded);
  };

  const onInputChange = (input?: string) => {
    // if (input === "") {
    //   setFilteredValue({...filteredValue, name: ""})
    // }
    setInputValue(input);
  };

  const onClear = () => {
    setFilteredValue({});
  };

  const trimFilterValues = () => {
    const copyFilteredValue = Object.assign({}, filteredValue);
    Object.keys(copyFilteredValue).forEach(key => {
      if(copyFilteredValue[key] === "") {
        delete copyFilteredValue[key];
      }
    });
    setTrimmedFilterValue(copyFilteredValue);
  }

  const onFilter = () => {
    if (inputValue) {
      setFilteredValue({...filteredValue, name: inputValue});
    }
  };


  const onChangeSelect = (event, selection) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection);
  };

  const onCloudProviderFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection('cloud_provider');
    setFilteredValue({ ...filteredValue, cloud_provider: selection });
    setIsCloudProviderFilterExpanded(false);
  };

  const onRegionFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection('region');
    setFilteredValue({ ...filteredValue, region: selection });
    setIsRegionFilterExpanded(false);
  };

  const onOwnerFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection('owner');
    setFilteredValue({ ...filteredValue, owner: selection });
    setIsOwnerFilterExpanded(false);
  };

  const onStatusFilterSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection('status');
    setFilteredValue({ ...filteredValue, status: selection });
    setIsStatusFilterExpanded(false);
  };

  const clearSelection = (value: string) => {
    if(value === 'cloud_provider') {
      setFilteredValue({ ...filteredValue, cloud_provider: "" });
      setIsStatusFilterExpanded(false);
    }
    if(value === 'region') {
      setFilteredValue({ ...filteredValue, region: "" });
      setIsRegionFilterExpanded
    }
    if(value === 'owner') {
      setFilteredValue({ ...filteredValue, owner: "" });
      setIsOwnerFilterExpanded(false);
    }
    if(value === 'status') {
      setFilteredValue({ ...filteredValue, status: "" });
      setIsStatusFilterExpanded(false);
    }
  };

  const onClearOwnerSelection = () => {
    setFilteredValue({ ...filteredValue, owner: "" });
    setIsOwnerFilterExpanded(false);
  }

  const deleteChip = (key: string) => {
    if (key === 'name') {
      setFilteredValue({ ...filteredValue, name: '' });
    }
    if (key === 'status') {
      setFilteredValue({ ...filteredValue, status: '' });
    }
    if (key === 'owner') {
      setFilteredValue({ ...filteredValue, owner: '' });
    }
  }

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
          { filterSelected === t('name') &&
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="filter text input"
                id="filterText"
                type="search"
                aria-label="Search filter input"
                placeholder={t('filter_by_name_lower')}
                onChange={onInputChange}
                value={inputValue}
                onClear={() => setFilteredValue({...filteredValue, name: ""})}
              />
              <Button variant={ButtonVariant.control} onClick={onFilter} aria-label="Search instances">
                <SearchIcon />
              </Button>
            </InputGroup>
            // <SearchInput
            //   placeholder={t('filter_by_name_lower')}
            //   value={inputValue}
            //   onChange={onInputChange}
            //   onClear={() => setFilteredValue({...filteredValue, name: ""})}
            // />
          }
          { filterSelected === t('cloud_provider') &&
              <Select
                variant={SelectVariant.single}
                aria-label="Select cloud provider"
                onToggle={onCloudProviderFilterToggle}
                selections={filteredValue["cloud_provider"] && filteredValue["cloud_provider"]}
                isOpen={isCloudProviderFilterExpanded}
                onSelect={onCloudProviderFilterSelect}
                placeholderText="Filter by cloud provider"
              >
                {cloudProviderFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
                ))}
              </Select>
          }
          { filterSelected === t('region') &&
            <Select
              variant={SelectVariant.single}
              aria-label="Select region"
              onToggle={onRegionFilterToggle}
              selections={filteredValue["region"] && filteredValue["region"]}
              isOpen={isRegionFilterExpanded}
              onSelect={onRegionFilterSelect}
              placeholderText="Filter by region"
            >
              {regionFilterOptions.map((option, index) => (
                <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
              ))}
            </Select>
          }
          { filterSelected === t('owner') &&
            <Select
              className="mk--filter-instances__toolbar--select--type-ahead"
              variant={SelectVariant.typeahead}
              typeAheadAriaLabel="Select an owner"
              aria-label="Select region"
              onToggle={onOwnerFilterToggle}
              selections={filteredValue["owner"] && filteredValue["owner"]}
              isOpen={isOwnerFilterExpanded}
              onSelect={onOwnerFilterSelect}
              onClear={onClearOwnerSelection}
              placeholderText="Filter by owner"
            >
              {listOfOwners && listOfOwners.map((option, index) => (
                <SelectOption key={index} value={option} />
              ))}
            </Select>
          }
          { filterSelected === t('status') &&
              <Select
                variant={SelectVariant.single}
                aria-label="Select status"
                onToggle={onStatusFilterToggle}
                selections={filteredValue["status"] && filteredValue["status"]}
                isOpen={isStatusFilterExpanded}
                onSelect={onStatusFilterSelect}
                placeholderText="Filter by status"
              >
                {statusFilterOptions.map((option, index) => (
                  <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
                ))}
              </Select>
            }
      </ToolbarGroup>
    </>
  );

  const toolbarChipGroup = (
    <ToolbarGroup>
      <ChipGroup>
        { trimmedFilterValue && Object.keys(trimmedFilterValue).map((key,index) => {
          if (trimmedFilterValue[key] !== '') {
            if(key === 'region' || key === 'cloud_provider') {
              return (
                <Chip key={index} onClick={() => deleteChip(key)} isReadOnly>
                  {t(key)}: {trimmedFilterValue[key]}
                </Chip>
              )
            }
            else {
              return (
                <Chip key={index} onClick={() => deleteChip(key)}>
                  {t(key)}: {trimmedFilterValue[key]}
                </Chip>
              )
            }
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
