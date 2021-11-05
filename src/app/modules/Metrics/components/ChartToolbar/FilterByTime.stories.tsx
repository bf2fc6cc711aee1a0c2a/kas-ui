import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { FilterByTime } from './FilterByTime';

export default {
  title: 'Metrics/FilterByTime',
  component: FilterByTime,
  args: {
    keyText: 'string',
    disableToolbar: false,
  },
} as ComponentMeta<typeof FilterByTime>;

const Template: ComponentStory<typeof FilterByTime> = (args) => (
  <FilterByTime {...args} />
);

export const Story = Template.bind({});
Story.args = {};
