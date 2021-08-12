import React, { useState } from 'react';
import { ToolbarItem, Select, SelectVariant, SelectGroup, SelectOption } from '@patternfly/react-core';
import { formatTime } from '../../utils';

type FilterByTimeProps = {
  setTimeDuration: (value: number) => void;
  setTimeInterval: (value: number) => void;
  keyText: string;
  disableToolbar: boolean;
};

export const FilterByTime = ({ setTimeDuration, setTimeInterval, keyText, disableToolbar }: FilterByTimeProps) => {
  const [selectedTime, setSelectedTime] = useState<boolean>(false);
  const [isTimeSelectOpen, setIsTimeSelectOpen] = useState<boolean>(false);

  const onTimeToggle = (isTimeSelectOpen) => {
    setIsTimeSelectOpen(isTimeSelectOpen);
  };

  const onTimeSelect = (_, selection) => {
    setTimeDuration(formatTime(selection).timeDuration);
    setTimeInterval(formatTime(selection).timeInterval);
    setSelectedTime(selection);
    setIsTimeSelectOpen(false);
  };

  const timeOptions = (keyText: string) => [
    <SelectGroup label="Relative time ranges" key={keyText + 'group1'}>
      <SelectOption key={keyText + 'time-filter' + 0} value="Last 5 minutes" />
      <SelectOption key={keyText + 'time-filter' + 1} value="Last 15 minutes" />
      <SelectOption key={keyText + 'time-filter' + 2} value="Last 30 minutes" />
      <SelectOption key={keyText + 'time-filter' + 3} value="Last 1 hour" />
      <SelectOption key={keyText + 'time-filter' + 4} value="Last 3 hours" />
      <SelectOption key={keyText + 'time-filter' + 5} value="Last 6 hours" />
      <SelectOption key={keyText + 'time-filter' + 6} value="Last 12 hours" />
      <SelectOption key={keyText + 'time-filter' + 7} value="Last 24 hours" />
      <SelectOption key={keyText + 'time-filter' + 8} value="Last 2 days" />
      <SelectOption key={keyText + 'time-filter' + 9} value="Last 7 days" />
    </SelectGroup>,
  ];
  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label="Select Input"
        onToggle={onTimeToggle}
        onSelect={onTimeSelect}
        selections={selectedTime}
        isOpen={isTimeSelectOpen}
        isDisabled={disableToolbar}
        placeholderText="Last 6 hours"
      >
        {timeOptions(keyText)}
      </Select>
    </ToolbarItem>
  );
};
