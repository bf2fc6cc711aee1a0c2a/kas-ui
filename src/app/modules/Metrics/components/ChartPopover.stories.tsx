import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ChartPopover } from './ChartPopover';

export default {
  title: 'Metrics/Components/ChartPopover',
  component: ChartPopover,
  args: {
    title: 'Sample title',
    description: 'lorem dolor ipsum',
  },
} as ComponentMeta<typeof ChartPopover>;

const Template: ComponentStory<typeof ChartPopover> = (args) => (
  <ChartPopover {...args} />
);

export const Sample = Template.bind({});
Sample.args = {};
