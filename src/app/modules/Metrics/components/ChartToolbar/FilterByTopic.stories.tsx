import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { FilterByTopic } from './FilterByTopic';

export default {
  title: 'Metrics/FilterByTopic',
  component: FilterByTopic,
  args: {
    selectedTopic: undefined,
    topicList: ['lorem', 'dolor', 'ipsum'],
    disableToolbar: false,
  },
} as ComponentMeta<typeof FilterByTopic>;

const Template: ComponentStory<typeof FilterByTopic> = (args) => (
  <FilterByTopic {...args} />
);

export const Story = Template.bind({});
Story.args = {};
