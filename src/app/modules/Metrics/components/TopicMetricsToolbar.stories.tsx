import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { TopicMetricsToolbar } from './TopicMetricsToolbar';

export default {
  title: 'Metrics/Components/TopicMetricsToolbar',
  component: TopicMetricsToolbar,
  controls: {},
  args: {
    title: 'Sample title',
    topicList: ['lorem', 'dolor', 'ipsum'],
    isDisabled: false,
    isRefreshing: false,
  },
} as ComponentMeta<typeof TopicMetricsToolbar>;

const Template: ComponentStory<typeof TopicMetricsToolbar> = (args) => (
  <TopicMetricsToolbar {...args} />
);

export const Example = Template.bind({});
Example.args = {};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};
