import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
  Tooltip,
} from '@patternfly/react-core';
import {
  FilterValue,
  ToolbarFilterItemProps,
} from '@app/common/ServiceTable/Toolbar/Filter';

export type SelectFilterProps = ToolbarFilterItemProps & {
  getSelectionForFilter: (key: string) => string[];
  tooltipContent: (fieldName?: string) => React.ReactNode;
};

export const SelectFilter: React.FunctionComponent<SelectFilterProps> = ({
  updateFilter,
  filterItem,
  filter,
  getSelectionForFilter,
  onDeleteChip,
  onDeleteChipGroup,
  filterSelected,
  isMaxFilter,
  tooltipContent,
}) => {
  const [toggled, setToggled] = useState<boolean>(false);
  const { t } = useTranslation();

  const id = `${filterItem.key}-select-filter`;

  const onToggle = () => {
    setToggled((prevState) => !prevState);
  };

  const onSelectFilter = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder === undefined || isPlaceholder) {
      setToggled(false);
      updateFilter(
        filterItem.key,
        { value: selection.toString(), isExact: true },
        true
      );
      if (filterItem.filterOptions?.length || 0 < 2) {
        setToggled(false);
      }
    }
  };

  const isDisabledSelectOption = (key: string, optionValue: string) => {
    // TODO rewrite using using functional style
    let newFilterValue: FilterValue | undefined;
    const newFilteredValue = filter[key];
    if (newFilteredValue) {
      const filterValue = newFilteredValue;
      newFilterValue = filterValue?.find(({ value }) => value === optionValue);
    }
    if (!newFilterValue) {
      return true;
    }
    return false;
  };

  return (
    <ToolbarFilter
      chips={getSelectionForFilter(filterItem.key)?.map((val) => t(val))}
      deleteChip={(_category, chip) => onDeleteChip(filterItem.key, chip)}
      deleteChipGroup={() => onDeleteChipGroup(filterItem.key)}
      categoryName={t(filterItem.key)}
      showToolbarItem={filterSelected === filterItem.key}
    >
      {filterSelected === filterItem.key && (
        <Select
          id={id}
          variant={SelectVariant.checkbox}
          aria-label={t(`filter_by_${filterItem.key}_aria_label`)}
          onToggle={onToggle}
          selections={getSelectionForFilter(filterItem.key)}
          isOpen={toggled}
          onSelect={onSelectFilter}
          placeholder={t(`filter_by_${filterItem.key}_placeholder`)}
          className='select-custom-width'
        >
          {filterItem.filterOptions?.map((option, index) => {
            const reference = document.getElementById(id);
            return (
              <SelectOption
                isDisabled={
                  option.disabled ||
                  (isMaxFilter &&
                    isDisabledSelectOption(filterItem.key, option.value))
                }
                key={index}
                value={option.value}
              >
                {isMaxFilter && (
                  <Tooltip
                    isVisible={isMaxFilter}
                    content={tooltipContent()}
                    reference={reference || undefined}
                  />
                )}
                {option.label}
              </SelectOption>
            );
          })}
        </Select>
      )}
    </ToolbarFilter>
  );
};
