import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonVariant,
  InputGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  TextInput,
  ToolbarChip,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  ValidatedOptions,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import { MASToolbar, ToolbarItemProps } from '@app/common';

export type ServiceAccountsToolbarProps = {
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
  total: number;
  page: number;
  perPage: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
  onCreateServiceAccount: () => void;
  mainToggle?: boolean;
};

export type FilterValue = {
  value: string;
  isExact: boolean;
};

export type FilterType = {
  filterKey: string;
  filterValue: FilterValue[];
};

const ServiceAccountsToolbar: React.FC<ServiceAccountsToolbarProps> = ({
  filterSelected,
  setFilterSelected,
  filteredValue,
  setFilteredValue,
  onCreateServiceAccount: onCreateServiceAccount,
}: ServiceAccountsToolbarProps) => {
  const { t } = useTranslation(['kasTemporaryFixMe']);
  const nameInputRef = useRef<HTMLInputElement>();
  const ownerInputRef = useRef<HTMLInputElement>();

  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [isOwnerValid, setIsOwnerValid] = useState<boolean>(true);
  const [isMaxFilter, setIsMaxFilter] = useState<boolean>(false);
  const [nameInputValue, setNameInputValue] = useState<string | undefined>();
  const [ownerInputValue, setOwnerInputValue] = useState<string | undefined>();

  const mainFilterOptions = [
    { label: t('name'), value: 'name', disabled: false },
    { label: t('owner'), value: 'owner', disabled: false },
  ];

  const onClearAllFilters = () => {
    setFilteredValue([]);
  };

  const onToggleFilter = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const onNameInputChange = (input?: string) => {
    setNameInputValue(input);
    !isNameValid && setIsNameValid(true);
  };

  const onOwnerInputChange = (input?: string) => {
    setOwnerInputValue(input);
    !isOwnerValid && setIsOwnerValid(true);
  };

  const isInputValid = (value?: string) => {
    return value
      ? /^([a-zA-Z0-9-_%]*[a-zA-Z0-9-_%])?$/.test(value.trim())
      : true;
  };

  const updateFilter = (
    key: string,
    filter: FilterValue,
    removeIfPresent: boolean
  ) => {
    const newFilterValue: FilterType[] = Object.assign([], filteredValue); // a copy for applied filter
    const filterIndex = newFilterValue.findIndex((f) => f.filterKey === key); // index of current key in applied filter
    if (filterIndex > -1) {
      // if filter is present with the current key
      const filterValue = newFilterValue[filterIndex];
      if (filterValue.filterValue && filterValue.filterValue.length > 0) {
        // if some filters are already there in applied filter for same key
        // index of current filter value in applied filter
        const filterValueIndex = filterValue.filterValue.findIndex(
          (f) => f.value === filter.value
        );
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

  const onFilter = (filterType: string) => {
    if (
      filterType === 'name' &&
      nameInputValue &&
      nameInputValue.trim() != ''
    ) {
      if (isInputValid(nameInputValue)) {
        updateFilter('name', { value: nameInputValue, isExact: false }, false);
        setNameInputValue('');
      } else {
        setIsNameValid(false);
      }
    } else if (
      filterType === 'owner' &&
      ownerInputValue &&
      ownerInputValue.trim() != ''
    ) {
      if (isInputValid(ownerInputValue)) {
        updateFilter(
          'owner',
          { value: ownerInputValue, isExact: false },
          false
        );
        setOwnerInputValue('');
      } else {
        setIsOwnerValid(false);
      }
    }
  };

  const onInputPress = (event: any) => {
    if (event.key === 'Enter' && !isMaxFilter) {
      const fieldName = event?.target?.name;
      onFilter(fieldName);
    }
  };

  const tooltipContent = (fieldName?: string) => {
    if (isMaxFilter) {
      return <div>{t('max_filter_message')}</div>;
    }
    return <div>{t('input_field_invalid_message', { name: fieldName })}</div>;
  };

  const onSelect = (_, selection: string | SelectOptionObject) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection?.toString());
  };

  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue.filter(
      (filter) => filter.filterKey === key
    );
    if (selectedFilters.length > 0) {
      return selectedFilters[0].filterValue.map((val) => val.value);
    }
    return [];
  };

  const onDeleteChip = (
    category: string,
    chip: string | ToolbarChip,
    filterOptions?: Array<any>
  ) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex(
      (filter) => filter.filterKey === category
    );
    const prevFilterValue: FilterValue[] = Object.assign(
      [],
      newFilteredValue[filterIndex]?.filterValue
    );
    let filterChip: string | undefined = chip.toString();
    /**
     * Filter chip from filter options
     */
    if (filterOptions && filterOptions?.length > 0) {
      filterChip = filterOptions?.find(
        (option) => option.label === chip.toString()
      )?.value;
    }
    /**
     * Delete selected chip from filter options
     */
    const chipIndex = prevFilterValue.findIndex(
      (val) => val.value === filterChip
    );
    if (chipIndex >= 0) {
      newFilteredValue[filterIndex].filterValue.splice(chipIndex, 1);
      setFilteredValue(newFilteredValue);
    }
  };

  const onDeleteChipGroup = (category: string) => {
    const newFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = newFilteredValue.findIndex(
      (filter) => filter.filterKey === category
    );
    if (filterIndex >= 0) {
      newFilteredValue.splice(filterIndex, 1);
      setFilteredValue(newFilteredValue);
    }
  };

  const toggleGroupItems = (
    <>
      <ToolbarGroup variant='filter-group'>
        <ToolbarItem>
          <Select
            variant={SelectVariant.single}
            aria-label='Select filter'
            onToggle={onToggleFilter}
            selections={filterSelected}
            isOpen={isFilterExpanded}
            onSelect={onSelect}
          >
            {mainFilterOptions.map((option, index) => (
              <SelectOption
                isDisabled={option.disabled}
                key={index}
                value={option.value}
              >
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
              <InputGroup>
                <TextInput
                  name='name'
                  id='name-input'
                  type='search'
                  aria-label={t('filter_by_name_lower')}
                  validated={
                    !isNameValid || isMaxFilter
                      ? ValidatedOptions.error
                      : ValidatedOptions.default
                  }
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
                  aria-label={t('filter_by_name_lower')}
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
            </ToolbarItem>
          )}
        </ToolbarFilter>
        <ToolbarFilter
          chips={getSelectionForFilter('owner')}
          deleteChip={(_category, chip) => onDeleteChip('owner', chip)}
          deleteChipGroup={() => onDeleteChipGroup('owner')}
          categoryName={t('owner')}
        >
          {filterSelected?.toLowerCase() === 'owner' && (
            <ToolbarItem>
              <InputGroup>
                <TextInput
                  name='owner'
                  id='owner-input'
                  type='search'
                  aria-label={t('filter_by_owner')}
                  placeholder={t('filter_by_owner')}
                  validated={
                    !isOwnerValid || isMaxFilter
                      ? ValidatedOptions.error
                      : ValidatedOptions.default
                  }
                  onChange={onOwnerInputChange}
                  onKeyPress={onInputPress}
                  value={ownerInputValue}
                  ref={ownerInputRef as React.RefObject<HTMLInputElement>}
                />
                <Button
                  isDisabled={!isOwnerValid || isMaxFilter}
                  variant={ButtonVariant.control}
                  onClick={() => onFilter('owner')}
                  aria-label={t('filter_by_owner')}
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
            </ToolbarItem>
          )}
        </ToolbarFilter>
      </ToolbarGroup>
    </>
  );

  const toolbarItems: ToolbarItemProps[] = [
    {
      item: (
        <Button
          variant='primary'
          onClick={onCreateServiceAccount}
          data-testid={'tableServiceAccounts-buttonCreateServiceAccount'}
        >
          {t('serviceAccount.create_service_account')}
        </Button>
      ),
    },
  ];
  /**
   * Todo: uncomment code when API start support pagination
   */
  // if (total && total > 0 && toolbarItems.length === 1) {
  //   toolbarItems.push({
  //     item: (
  //       <MASPagination
  //         widgetId="pagination-options-menu-top"
  //         itemCount={total}
  //         page={page}
  //         perPage={perPage}
  //         isCompact={true}
  //         titles={{
  //           paginationTitle: t('minimal_pagination'),
  //           perPageSuffix: t('per_page_suffix'),
  //           toFirstPage: t('to_first_page'),
  //           toPreviousPage: t('to_previous_page'),
  //           toLastPage: t('to_last_page'),
  //           toNextPage: t('to_next_page'),
  //           optionsToggle: t('options_toggle'),
  //           currPage: t('curr_page'),
  //         }}
  //       />
  //     ),
  //     variant: 'pagination',
  //     alignment: { default: 'alignRight' },
  //   });
  // }

  return (
    <MASToolbar
      toolbarProps={{
        id: 'instance-toolbar',
        clearAllFilters: onClearAllFilters,
        collapseListedFiltersBreakpoint: 'md',
        inset: { xl: 'insetLg' },
      }}
      toolbarItems={toolbarItems}
    />
  );
};

export { ServiceAccountsToolbar };
