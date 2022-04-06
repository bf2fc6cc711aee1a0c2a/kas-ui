import { FilterProps } from "@app/modules/OpenshiftStreams/components/TableFilters/types";
import { useRef, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
  Tooltip,
} from "@patternfly/react-core";
import { cloudRegionOptions, KeyValueOptions } from "@app/utils";
import { useTooltipContent } from "@app/modules/OpenshiftStreams/components/TableFilters/hooks";

export type RegionFilterProps = FilterProps;

export const RegionFilter: React.FunctionComponent<RegionFilterProps> = ({
  getSelectionForFilter,
  onDeleteChip,
  onDeleteChipGroup,
  removeFilterValue,
  isDisabledSelectOption,
  isMaxFilter,
  filterSelected,
  updateFilter,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const options = cloudRegionOptions.map((region) => {
    return { label: t(region.value), value: region.value, disabled: false };
  });

  return (
    <ToolbarFilter
      chips={getSelectionForFilter("region")?.map((val) => t(val))}
      deleteChip={(_category, chip) => onDeleteChip("region", chip, options)}
      deleteChipGroup={() => onDeleteChipGroup("region")}
      categoryName={t("region")}
      showToolbarItem={filterSelected === "region"}
    >
      <RegionSelect
        updateFilter={updateFilter}
        isMaxFilter={isMaxFilter}
        removeFilterValue={removeFilterValue}
        isDisabledSelectOption={isDisabledSelectOption}
        options={options}
        getSelectionForFilter={getSelectionForFilter}
        filterSelected={filterSelected}
      />
    </ToolbarFilter>
  );
};

type RegionSelectProps = Pick<
  FilterProps,
  | "updateFilter"
  | "isMaxFilter"
  | "removeFilterValue"
  | "isDisabledSelectOption"
  | "getSelectionForFilter"
  | "filterSelected"
> & {
  options: KeyValueOptions[];
};

const RegionSelect: React.FunctionComponent<RegionSelectProps> = ({
  updateFilter,
  isMaxFilter,
  removeFilterValue,
  isDisabledSelectOption,
  options,
  getSelectionForFilter,
  filterSelected,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const selectRef = useRef<Select>(null);
  const tooltipContent = useTooltipContent(isMaxFilter);
  const [expanded, setExpanded] = useState(false);

  const FilterTooltip: React.FunctionComponent = () => {
    if (isMaxFilter) {
      return (
        <Tooltip
          isVisible={isMaxFilter}
          content={tooltipContent}
          reference={selectRef}
        />
      );
    }
    return <></>;
  };

  const onToggle = () => {
    setExpanded(!expanded);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean | undefined
  ) => {
    if (isPlaceholder) clear();
    updateFilter(
      "region",
      { value: selection.toString(), isExact: true },
      true
    );
    options.length < 2 && setExpanded(false);
  };

  const clear = () => {
    removeFilterValue("region");
    setExpanded(false);
  };

  if (filterSelected === "region") {
    return (
      <Select
        id="region-select"
        variant={SelectVariant.checkbox}
        aria-label="Select region"
        onToggle={onToggle}
        selections={getSelectionForFilter("region")}
        isOpen={expanded}
        onSelect={onSelect}
        placeholderText={t("filter_by_region")}
        className="select-custom-width"
        ref={selectRef}
      >
        {options.map((option, index) => {
          const isDisabled = () => {
            if (option.disabled) {
              return true;
            }
            return (
              isMaxFilter && isDisabledSelectOption("region", option.value)
            );
          };
          return (
            <SelectOption
              isDisabled={isDisabled()}
              key={index}
              value={option.value}
            >
              <FilterTooltip />
              {option.label}
            </SelectOption>
          );
        })}
      </Select>
    );
  }
  return <></>;
};
