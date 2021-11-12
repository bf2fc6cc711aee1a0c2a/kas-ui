import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarItem,
} from '@patternfly/react-core';

export type FilterSelectProps = {
  filterSelected?: string;
  setFilterSelected: (value: string) => void;
};

export const FilterSelect: React.FunctionComponent<FilterSelectProps> = ({
  setFilterSelected,
  filterSelected,
}) => {
  const { t } = useTranslation();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const onToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent,
    selection: string | SelectOptionObject
  ) => {
    setIsFilterExpanded(!isFilterExpanded);
    setFilterSelected(selection?.toString());
  };

  const options = [
    { label: t('name'), value: 'name', disabled: false },
    { label: t('cloud_provider'), value: 'cloud_provider', disabled: false },
    { label: t('region'), value: 'region', disabled: false },
    { label: t('owner'), value: 'owner', disabled: false },
    { label: t('status'), value: 'status', disabled: false },
  ];

  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label='Select filter'
        onToggle={onToggle}
        selections={filterSelected}
        isOpen={isFilterExpanded}
        onSelect={onSelect}
      >
        {options.map((option, index) => (
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
  );
};
