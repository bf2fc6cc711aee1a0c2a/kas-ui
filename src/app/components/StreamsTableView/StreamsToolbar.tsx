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
  const [inputValue, setInputValue] = useState<string | undefined>();
  const { t } = useTranslation();

  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // options for filter dropdown
  const filterOptions = [
    { value: 'Name', disabled: false },
    { value: 'Status', disabled: false }
  ];

  const onInputChange = (input?: string) => {
    setInputValue(input);
  };

  const onClear = () => {
    setFilteredValue({});
  };

  const onDeleteGroup = (category: string | ToolbarChipGroup) => {
    
    // if (category.toString().toLowerCase() === 'name') {
    //   setFilteredValue({...filteredValue, name: []});
    // }

    // this.setState(prevState => {
    //   prevState.filters[type.toLowerCase()] = [];
    //   return {
    //     filters: prevState.filters
    //   };
    // });
  };

  const onDelete = (category: string | ToolbarChipGroup, chip: ToolbarChip | string) => {
    if (category.toString().toLowerCase() === 'name') {
      const index = filteredValue.findIndex((name) => name === chip.toString().toLowerCase());
      if (index >= 0) {
        const prevState = Object.assign([], filteredValue);
        prevState.splice(index, 1);
        setFilteredValue(prevState);
      }
    }
  };

  const onFilter = () => {
    // if (inputValue) {
    //   setFilteredValue([inputValue, ...filteredValue]);
    // }
  };

  const getPlaceholder = () => {
    if (filterSelected) {
      const placeholder = filterSelected?.toLowerCase() + '_lower';
      return t(`filter_by_${placeholder}`);
    }
    return '';
  };

  const onFilterSelect = (event, selection) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection);
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={filteredValue.name}
          deleteChip={onDelete}
          deleteChipGroup={onDeleteGroup}
          categoryName={t('name')}
        >
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected && t(filterSelected.toLowerCase())}
            isOpen={isFilterExpanded}
            onSelect={onFilterSelect}
          >
            {filterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
            ))}
          </Select>
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
        </ToolbarFilter>

        <ToolbarFilter
          chips={filteredValue.status}
          deleteChip={onDelete}
          deleteChipGroup={onDeleteGroup}
          categoryName={t('status')}
        >
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected && t(filterSelected.toLowerCase())}
            isOpen={isFilterExpanded}
            onSelect={onFilterSelect}
          >
            {filterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
            ))}
          </Select>
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
        </ToolbarFilter>


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
