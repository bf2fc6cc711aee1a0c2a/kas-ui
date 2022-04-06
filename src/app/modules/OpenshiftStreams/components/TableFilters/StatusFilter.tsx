import { FilterProps } from "@app/modules/OpenshiftStreams/components/TableFilters/types";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTooltipContent } from "@app/modules/OpenshiftStreams/components/TableFilters/hooks";
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
  Tooltip,
} from "@patternfly/react-core";
import { InstanceStatus, statusOptions, KeyValueOptions } from "@app/utils";

export type StatusFilter = FilterProps;

export const StatusFilter: React.FunctionComponent<StatusFilter> = ({
  getSelectionForFilter,
  onDeleteChip,
  onDeleteChipGroup,
  isMaxFilter,
  filterSelected,
  updateFilter,
  removeFilterValue,
  isDisabledSelectOption,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);

  const statusFilterOptions = statusOptions
    .filter(
      (s) =>
        s.value !== InstanceStatus.PREPARING &&
        s.value !== InstanceStatus.DELETED
    )
    .map((status) => {
      return { label: t(status.value), value: status.value, disabled: false };
    });

  return (
    <ToolbarFilter
      chips={getSelectionForFilter("status")?.map((val) => t(val))}
      deleteChip={(_category, chip) =>
        onDeleteChip("status", chip, statusFilterOptions)
      }
      deleteChipGroup={() => onDeleteChipGroup("status")}
      categoryName={t("status")}
      showToolbarItem={filterSelected === "status"}
    >
      <StatusSelect
        updateFilter={updateFilter}
        isMaxFilter={isMaxFilter}
        removeFilterValue={removeFilterValue}
        isDisabledSelectOption={isDisabledSelectOption}
        statusFilterOptions={statusFilterOptions}
        getSelectionForFilter={getSelectionForFilter}
        filterSelected={filterSelected}
      />
    </ToolbarFilter>
  );
};

type StatusSelectProps = Pick<
  FilterProps,
  | "updateFilter"
  | "isMaxFilter"
  | "removeFilterValue"
  | "isDisabledSelectOption"
  | "getSelectionForFilter"
  | "filterSelected"
> & {
  statusFilterOptions: KeyValueOptions[];
};

const StatusSelect: React.FunctionComponent<StatusSelectProps> = ({
  updateFilter,
  isMaxFilter,
  removeFilterValue,
  isDisabledSelectOption,
  statusFilterOptions,
  getSelectionForFilter,
  filterSelected,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const tooltipContent = useTooltipContent(isMaxFilter);
  const selectRef = useRef<Select>(null);

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
      "status",
      { value: selection.toString(), isExact: true },
      true
    );
  };

  const clear = () => {
    removeFilterValue("status");
    setExpanded(false);
  };
  if (filterSelected === "status") {
    return (
      <Select
        id="status-select"
        variant={SelectVariant.checkbox}
        aria-label="Select status"
        onToggle={onToggle}
        selections={getSelectionForFilter("status")}
        isOpen={expanded}
        onSelect={onSelect}
        placeholderText={t("filter_by_status")}
        className="select-custom-width"
        ref={selectRef}
      >
        {statusFilterOptions.map((option, index) => {
          const isDisabled = () => {
            if (option.disabled) {
              return true;
            }
            return (
              isMaxFilter && isDisabledSelectOption("status", option.value)
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
