import { Field, FilterOptionType } from '@app/modules/KasTable/config';
import React from 'react';
import { ToolbarChip } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TextInputFilter } from '@app/common/ServiceTable/Toolbar/TextInputFilter';
import { SelectFilter } from '@app/common/ServiceTable/Toolbar/SelectFilter';

export type FilterValue = {
  value: string;
  isExact: boolean;
};

export type FilterTypes = {
  [key: string]: FilterValue[];
};

export type ToolbarFilterItemProps = {
  filterSelected: string;
  filterItem: Field;
  filter: FilterTypes;
  isMaxFilter: boolean;
  onDeleteChip: (key: string, chip: string | ToolbarChip) => void;
  onDeleteChipGroup: (key: string) => void;
  updateFilter: (
    key: string,
    filterValue: FilterValue,
    removeIfPresent: boolean
  ) => void;
};

export const Filter: React.FunctionComponent<ToolbarFilterItemProps> = ({
  filter,
  filterSelected,
  filterItem,
  isMaxFilter,
  onDeleteChip,
  onDeleteChipGroup,
  updateFilter,
}) => {
  const { t } = useTranslation();

  const getSelectionForFilter = (key: string) => {
    return (filter[key] || []).map((val) => val.value);
  };

  const tooltipContent = (fieldName?: string) => {
    if (isMaxFilter) {
      return <div>{t('max_filter_message')}</div>;
    }
    return <div>{t('input_field_invalid_message', { name: fieldName })}</div>;
  };

  if (filterSelected !== filterItem.key) {
    return <></>;
  }

  if (filterItem.filterType === FilterOptionType.TEXT_INPUT) {
    return (
      <TextInputFilter
        filterSelected={filterSelected}
        filterItem={filterItem}
        filter={filter}
        isMaxFilter={isMaxFilter}
        onDeleteChip={onDeleteChip}
        onDeleteChipGroup={onDeleteChipGroup}
        updateFilter={updateFilter}
        getSelectionForFilter={getSelectionForFilter}
        tooltipContent={tooltipContent}
      />
    );
  } else if (filterItem.filterType === FilterOptionType.SELECT) {
    return (
      <SelectFilter
        filterSelected={filterSelected}
        filterItem={filterItem}
        filter={filter}
        isMaxFilter={isMaxFilter}
        onDeleteChip={onDeleteChip}
        onDeleteChipGroup={onDeleteChipGroup}
        updateFilter={updateFilter}
        getSelectionForFilter={getSelectionForFilter}
        tooltipContent={tooltipContent}
      />
    );
  }
  return <></>;
};
