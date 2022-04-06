import { FunctionComponent } from "react";
import { ToolbarChip, ToolbarGroup } from "@patternfly/react-core";
import { CloudProviderFilter } from "@app/modules/OpenshiftStreams/components/TableFilters/CloudProviderFilter";
import { NameFilter } from "@app/modules/OpenshiftStreams/components/TableFilters/NameFilter";
import { OwnerFilter } from "@app/modules/OpenshiftStreams/components/TableFilters/OwnerFilter";
import { RegionFilter } from "@app/modules/OpenshiftStreams/components/TableFilters/RegionFilter";
import { FilterSelect } from "@app/modules/OpenshiftStreams/components/TableFilters/FilterSelect";
import { StatusFilter } from "@app/modules/OpenshiftStreams/components/TableFilters/StatusFilter";
import { KeyValueOptions } from "@app/utils";
import {
  FilterType,
  FilterValue,
} from "@app/modules/OpenshiftStreams/components";

export type StreamsFilterGroupProps = {
  isMaxFilter: boolean;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
};

export const StreamsFilterGroup: FunctionComponent<StreamsFilterGroupProps> = ({
  isMaxFilter,
  filteredValue,
  setFilteredValue,
  filterSelected,
  setFilterSelected,
}) => {
  const isDisabledSelectOption = (key: string, optionValue: string) => {
    let newFilterValue: FilterValue | undefined;
    const newFilteredValue = filteredValue?.filter(
      ({ filterKey }) => filterKey === key
    );
    if (newFilteredValue && newFilteredValue?.length > 0) {
      const { filterValue } = newFilteredValue[0];
      newFilterValue = filterValue?.find(({ value }) => value === optionValue);
    }
    if (!newFilterValue) {
      return true;
    }
    return false;
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
        const filterValueIndex = filterValue.filterValue.findIndex(
          (f) => f.value === filter.value
        ); // index of current filter value in applied filter
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

  const getSelectionForFilter = (key: string) => {
    const selectedFilters = filteredValue.filter(
      (filter) => filter.filterKey === key
    );
    if (selectedFilters.length > 0) {
      return selectedFilters[0].filterValue.map((val) => val.value);
    }
    return;
  };

  const onDeleteChip = (
    category: string,
    chip: string | ToolbarChip,
    filterOptions?: KeyValueOptions[]
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
     * Filter chip from filter cloudProviderOptions
     */
    if (filterOptions && filterOptions?.length > 0) {
      filterChip = filterOptions?.find(
        (option) => option.label === chip.toString()
      )?.value;
    }
    /**
     * Delete selected chip from filter cloudProviderOptions
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

  const removeFilteredValue = (value: string) => {
    const copyFilteredValue: FilterType[] = Object.assign([], filteredValue);
    const filterIndex = copyFilteredValue.findIndex(
      (filter) => filter.filterKey === value
    );
    if (filterIndex >= 0) {
      copyFilteredValue.splice(filterIndex, 1);
    }
    setFilteredValue(copyFilteredValue);
  };

  return (
    <>
      <ToolbarGroup variant="filter-group">
        <FilterSelect
          setFilterSelected={setFilterSelected}
          filterSelected={filterSelected}
        />
        <NameFilter
          isMaxFilter={isMaxFilter}
          filterSelected={filterSelected}
          getSelectionForFilter={getSelectionForFilter}
          updateFilter={updateFilter}
          onDeleteChip={onDeleteChip}
          onDeleteChipGroup={onDeleteChipGroup}
          removeFilterValue={removeFilteredValue}
          isDisabledSelectOption={isDisabledSelectOption}
        />
        <CloudProviderFilter
          isMaxFilter={isMaxFilter}
          filterSelected={filterSelected}
          getSelectionForFilter={getSelectionForFilter}
          updateFilter={updateFilter}
          onDeleteChip={onDeleteChip}
          onDeleteChipGroup={onDeleteChipGroup}
          removeFilterValue={removeFilteredValue}
          isDisabledSelectOption={isDisabledSelectOption}
        />
        <RegionFilter
          isMaxFilter={isMaxFilter}
          filterSelected={filterSelected}
          getSelectionForFilter={getSelectionForFilter}
          updateFilter={updateFilter}
          onDeleteChip={onDeleteChip}
          onDeleteChipGroup={onDeleteChipGroup}
          removeFilterValue={removeFilteredValue}
          isDisabledSelectOption={isDisabledSelectOption}
        />
        <OwnerFilter
          isMaxFilter={isMaxFilter}
          filterSelected={filterSelected}
          getSelectionForFilter={getSelectionForFilter}
          updateFilter={updateFilter}
          onDeleteChip={onDeleteChip}
          onDeleteChipGroup={onDeleteChipGroup}
          removeFilterValue={removeFilteredValue}
          isDisabledSelectOption={isDisabledSelectOption}
        />
        <StatusFilter
          isMaxFilter={isMaxFilter}
          filterSelected={filterSelected}
          getSelectionForFilter={getSelectionForFilter}
          updateFilter={updateFilter}
          onDeleteChip={onDeleteChip}
          onDeleteChipGroup={onDeleteChipGroup}
          removeFilterValue={removeFilteredValue}
          isDisabledSelectOption={isDisabledSelectOption}
        />
      </ToolbarGroup>
    </>
  );
};
