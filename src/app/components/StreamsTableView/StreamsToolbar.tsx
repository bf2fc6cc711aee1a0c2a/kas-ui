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
  namesSelected: string[];
  setNamesSelected: (value: string[]) => void;
  total: number;
  page: number;
  perPage: number;
};

const StreamsToolbar: React.FunctionComponent<StreamsToolbarProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  filterSelected,
  namesSelected,
  setNamesSelected,
  mainToggle,
  total,
  page,
  perPage,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>();
  const { t } = useTranslation();
  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // options for filter dropdown
  const filterOptions = [{ value: 'Name', disabled: false }];

  const onInputChange = (input?: string) => {
    setInputValue(input);
  };

  const onClear = () => {
    setNamesSelected([]);
  };

  const onDeleteGroup = (category: string | ToolbarChipGroup) => {
    if (category.toString().toLowerCase() === 'name') {
      setNamesSelected([]);
    }
  };
  const onDelete = (category: string | ToolbarChipGroup, chip: ToolbarChip | string) => {
    if (category.toString().toLowerCase() === 'name') {
      const index = namesSelected.findIndex((name) => name === chip.toString().toLowerCase());
      if (index >= 0) {
        const prevState = Object.assign([], namesSelected);
        prevState.splice(index, 1);
        setNamesSelected(prevState);
      }
    }
  };

  const onSearch = () => {
    if (inputValue && inputValue.trim() !== '') {
      const index = namesSelected.findIndex((name) => name === inputValue.trim().toLowerCase());
      if (index < 0) {
        setNamesSelected([...namesSelected, inputValue.trim()]);
        setInputValue('');
      }
    }
  };
  const getPlaceholder = () => {
    if (filterSelected) {
      const placeholder = filterSelected?.toLowerCase() + '_lower';
      return t(`filter_by_${placeholder}`);
    }
    return '';
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant="filter-group">
        <ToolbarFilter
          chips={namesSelected}
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
          >
            {filterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={t(option.value.toLowerCase())} />
            ))}
          </Select>
          <InputGroup className="mk--filter-instances__toolbar--text-input">
            <TextInput
              name="filter text input"
              id="filterText"
              type="search"
              aria-label="Search filter input"
              placeholder={getPlaceholder()}
              onChange={onInputChange}
              value={inputValue}
            />
            <Button variant={ButtonVariant.control} onClick={onSearch} aria-label="Search instances">
              <SearchIcon />
            </Button>
          </InputGroup>
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );

  return (
    <Toolbar id="instance-toolbar" collapseListedFiltersBreakpoint="md" clearAllFilters={onClear} inset={{ lg: 'insetLg' }}>
      <ToolbarContent>
        {mainToggle && (
          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md">
            {toggleGroupItems}
          </ToolbarToggleGroup>
        )}
        <ToolbarItem>
          <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
            {t('create_kafka_instance')}
          </Button>
        </ToolbarItem>
        <ToolbarItem variant="pagination" alignment={{ default: 'alignRight' }}>
          <TablePagination
            widgetId="pagination-options-menu-top"
            itemCount={total}
            page={page as any}
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
