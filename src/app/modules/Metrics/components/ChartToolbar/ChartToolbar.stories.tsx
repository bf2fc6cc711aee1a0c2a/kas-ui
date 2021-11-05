import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ChartToolbar } from './ChartToolbar';

export default {
  title: 'Metrics/ChartToolbar',
  component: ChartToolbar,
  controls: {},
  args: {
    title: 'Sample title',
    selectedTopic: undefined,
    onRefreshKafkaToolbar: () => false,
    onRefreshTopicToolbar: () => false,
    topicList: ['lorem', 'dolor', 'ipsum'],
  },
} as ComponentMeta<typeof ChartToolbar>;

const Template: ComponentStory<typeof ChartToolbar> = (args) => (
  <ChartToolbar {...args} />
);

export const AllFilters = Template.bind({});
AllFilters.args = {
  showTopicFilter: true,
  showTopicToolbar: true,
  showKafkaToolbar: true,
};

export const AllFilters_AllDisabled = Template.bind({});
AllFilters_AllDisabled.args = {
  showTopicFilter: true,
  showTopicToolbar: false,
  showKafkaToolbar: false,
};
export const TimeRangeOnly = Template.bind({});
TimeRangeOnly.args = {
  showTopicFilter: false,
  showTopicToolbar: true,
  showKafkaToolbar: true,
};

export const TimeRangeOnly_Disabled = Template.bind({});
TimeRangeOnly_Disabled.args = {
  showTopicFilter: false,
  showTopicToolbar: true,
  showKafkaToolbar: false,
};
