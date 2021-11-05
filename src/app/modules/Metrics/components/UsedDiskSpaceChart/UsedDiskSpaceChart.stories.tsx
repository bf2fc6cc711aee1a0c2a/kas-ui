import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { UsedDiskSpaceChart } from './UsedDiskSpaceChart';

export default {
  title: 'Metrics/UsedDiskSpaceChart',
  component: UsedDiskSpaceChart,
  args: {},
} as ComponentMeta<typeof UsedDiskSpaceChart>;

const Template: ComponentStory<typeof UsedDiskSpaceChart> = (args) => (
  <UsedDiskSpaceChart {...args} />
);

export const Story = Template.bind({});
Story.args = {};
