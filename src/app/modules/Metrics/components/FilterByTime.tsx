import React, { useState } from 'react';
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectGroup,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';

const DurationOptionsMap = {
  5: 'Last 5 minutes',
  15: 'Last 15 minutes',
  30: 'Last 30 minutes',
  60: 'Last 1 hour',
  180: 'Last 3 hours',
  360: 'Last 6 hours',
  720: 'Last 12 hours',
  1400: 'Last 24 hours',
  2800: 'Last 2 days',
  100080: 'Last 7 days',
};

export type DurationOptions = keyof typeof DurationOptionsMap;

type FilterByTimeProps = {
  timeDuration: DurationOptions;
  onDurationChange: (value: DurationOptions) => void;
  keyText: string;
  disableToolbar: boolean;
};

export const FilterByTime = ({
  timeDuration,
  keyText,
  disableToolbar,
  onDurationChange,
}: FilterByTimeProps) => {
  const [isTimeSelectOpen, setIsTimeSelectOpen] = useState<boolean>(false);

  const onTimeToggle = (isTimeSelectOpen) => {
    setIsTimeSelectOpen(isTimeSelectOpen);
  };

  const onTimeSelect: SelectProps['onSelect'] = (_, selection) => {
    const mapping = Object.entries(DurationOptionsMap).find(
      ([_, value]) => value === selection
    );
    if (mapping) {
      onDurationChange(parseInt(mapping[0], 10) as DurationOptions);
    }
    setIsTimeSelectOpen(false);
  };

  const timeOptions = (keyText: string) => [
    <SelectGroup label='Relative time ranges' key={`${keyText}-group`}>
      {Object.values(DurationOptionsMap).map((label, idx) => (
        <SelectOption key={`${keyText}-${idx}`} value={label} />
      ))}
    </SelectGroup>,
  ];
  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label='Select Input'
        onToggle={onTimeToggle}
        onSelect={onTimeSelect}
        selections={DurationOptionsMap[timeDuration]}
        isOpen={isTimeSelectOpen}
        isDisabled={disableToolbar}
        placeholderText='Last 6 hours'
      >
        {timeOptions(keyText)}
      </Select>
    </ToolbarItem>
  );
};
