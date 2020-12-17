import React, { useState } from 'react';
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
  setFilteredValue
}) => {

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>();
  const { t } = useTranslation();

  console.log('what is filtered Value in the Toolbar' + JSON.stringify(filteredValue));

  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const onStatusFilterToggle = () => {
    setIsStatusFilterExpanded(!isStatusFilterExpanded);
  };

  // options for filter dropdown
  const mainFilterOptions = [
    { value: 'Name', disabled: false },
    { value: 'Status', disabled: false }
  ];

  const statusFilterOptions = [
    { value: 'Ready', disabled: false },
    { value: 'Failed', disabled: false },
    { value: 'Creation in Progress', disabled: false },
    { value: 'Creation Pending', disabled: false }
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

  const onDeleteGroup = (category: string | ToolbarChipGroup) => {
    var categoryLower = category.toString().toLowerCase();
    
    if (categoryLower === 'name') {
      setFilteredValue({...filteredValue, name: ""});
    }

    if (categoryLower === 'status') {
      setFilteredValue({...filteredValue, status: []});
    }
  };

  const onDelete = (category: string | ToolbarChipGroup, chip: ToolbarChip | string) => {
    var categoryLower = category.toString().toLowerCase();
    if (categoryLower === 'status') {
      var indexOfItem = filteredValue["status"].indexOf(chip);
      var copiedArray = [...filteredValue["status"]];
      if (indexOfItem >= 0) {
          copiedArray.splice(indexOfItem, 1);
          setFilteredValue({ ...filteredValue, status: copiedArray })
        }
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

  const onStatusFilterSelect = (event, selection: string) => {
    var indexOfItem = filteredValue["status"].indexOf(selection);

    var copiedArray = [...filteredValue["status"]];
      if (indexOfItem !== -1) {
        copiedArray.splice(indexOfItem, 1);
        setFilteredValue({ ...filteredValue, status: copiedArray })
      } else {
        setFilteredValue({ ...filteredValue, status: copiedArray.concat(selection) })
      }
      setIsStatusFilterExpanded(!isStatusFilterExpanded);
  };


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
          { filterSelected === "Status" &&
            <ToolbarFilter
              chips={filteredValue.status}
              deleteChip={onDelete}
              deleteChipGroup={onDeleteGroup}
              categoryName={t('status')}
            >
              <Select
                variant={SelectVariant.checkbox}
                aria-label="Select status filter"
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
            </ToolbarFilter>
}

      </ToolbarGroup>
    </>
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
    </Toolbar>
  );
};

export { StreamsToolbar };
