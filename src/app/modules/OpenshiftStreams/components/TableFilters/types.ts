import { ToolbarChip } from '@patternfly/react-core';
import { KeyValueOptions } from '@app/utils';

export type FilterProps = {
  getSelectionForFilter: (key: string) => string[] | undefined;
  onDeleteChip: (
    category: string,
    chip: string | ToolbarChip,
    filterOptions?: KeyValueOptions[]
  ) => void;
  onDeleteChipGroup: (category: string) => void;
  filterSelected?: string;
  isMaxFilter: boolean;
  updateFilter: (
    key: string,
    filter: FilterValue,
    removeIfPresent: boolean
  ) => void;
  removeFilterValue: (value: string) => void;
  isDisabledSelectOption: (key: string, optionValue: string) => boolean;
};

export type FilterValue = {
  value: string;
  isExact: boolean;
};

export type FilterType = {
  filterKey: string;
  filterValue: FilterValue[];
};
