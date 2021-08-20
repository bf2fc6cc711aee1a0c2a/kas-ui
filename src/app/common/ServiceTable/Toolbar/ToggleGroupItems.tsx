import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarChip,
  ToolbarGroup,
} from '@patternfly/react-core';
import { InstanceStatus, MAX_FILTER_LIMIT } from '@app/utils';
import { ServiceTableConfig } from '@app/modules/KasTable/config';
import {
  Filter,
  FilterTypes,
  FilterValue,
} from '@app/common/ServiceTable/Toolbar/Filter';

export type ToggeGroupItemsProps = {
  setFilterSelected: (value: string) => void;
  filter: FilterTypes;
  setFilter: React.Dispatch<React.SetStateAction<FilterTypes>>;
  filterSelected: string;
  isMaxFilter: boolean;
  setIsMaxFilter: (value: boolean) => void;
  config: ServiceTableConfig;
};

export const ToggleGroupItems: React.FunctionComponent<ToggeGroupItemsProps> =
  ({
    setFilterSelected,
    filterSelected,
    filter,
    setFilter,
    isMaxFilter,
    setIsMaxFilter,
    config,
  }) => {
    const [isFilterTypeExpanded, setIsFilterTypeExpanded] = useState(false);

    const onFilterTypeToggle = () => {
      setIsFilterTypeExpanded(!isFilterTypeExpanded);
    };

    const onChangeTypeSelect = (
      _event:
        | React.MouseEvent<Element, MouseEvent>
        | React.ChangeEvent<Element>,
      selection: string | SelectOptionObject
    ) => {
      setIsFilterTypeExpanded(!isFilterTypeExpanded);
      setFilterSelected(selection?.toString());
    };

    const handleMaxFilters = () => {
      // TODO rewrite using using functional style
      let maxFilterCount = 0;
      Object.entries(filter).forEach(([filterKey, filterValue]) => {
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

    useEffect(() => {
      handleMaxFilters();
    }, [filter, handleMaxFilters]);

    const updateFilter = (key: string, filterValue: FilterValue) => {
      setFilter((prevState) => {
        const answer = prevState[key] || [];
        if (!answer.some((v) => v.value === filterValue.value)) {
          answer.push(filterValue);
        }
        return { ...prevState, ...{ [key]: answer } };
      });
    };

    const onDeleteChip = (key: string, chip: string | ToolbarChip) => {
      setFilter((prevState) => {
        return {
          ...prevState,
          ...{
            [key]: prevState[key].filter((v) => v.value !== chip.toString()),
          },
        };
      });
    };

    const onDeleteChipGroup = (key: string) => {
      setFilter((prevState) => {
        return { ...prevState, ...{ [key]: [] } };
      });
    };

    return (
      <>
        <ToolbarGroup variant='filter-group'>
          <Select
            variant={SelectVariant.single}
            aria-label='Select filter'
            onToggle={onFilterTypeToggle}
            selections={filterSelected}
            isOpen={isFilterTypeExpanded}
            onSelect={onChangeTypeSelect}
          >
            {config.fields.map((option, index) => (
              <SelectOption
                isDisabled={option.filterDisabled}
                key={index}
                value={option.key}
              >
                {option.label}
              </SelectOption>
            ))}
          </Select>
          {config.fields.map((filterItem, index) => {
            return (
              <Filter
                key={index}
                filter={filter}
                isMaxFilter={isMaxFilter}
                filterSelected={filterSelected}
                filterItem={filterItem}
                onDeleteChip={onDeleteChip}
                onDeleteChipGroup={onDeleteChipGroup}
                updateFilter={updateFilter}
              />
            );
          })}
        </ToolbarGroup>
      </>
    );
  };
