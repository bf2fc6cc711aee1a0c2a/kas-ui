import { Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import React from 'react';

type ChartPopoverProps = {
  title: string;
  description: string;
};

export const ChartPopover = ({ title, description }: ChartPopoverProps) => {
  return (
    <Popover aria-label="Basic popover" headerContent={<div>{title}</div>} bodyContent={<div>{description}</div>}>
      <OutlinedQuestionCircleIcon />
    </Popover>
  );
};
