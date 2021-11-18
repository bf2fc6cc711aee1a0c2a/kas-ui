import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { TopicsMetricsToolbar } from './TopicsMetricsToolbar';

export default {
  title: 'Metrics/Components/TopicsMetricsToolbar',
  component: TopicsMetricsToolbar,
  controls: {},
  args: {
    title: 'Sample title',
    topicList: ['lorem', 'dolor', 'ipsum'],
    isDisabled: false,
    isRefreshing: false,
  },
} as ComponentMeta<typeof TopicsMetricsToolbar>;

const Template: ComponentStory<typeof TopicsMetricsToolbar> = (args) => (
  <TopicsMetricsToolbar {...args} />
);

export const Example = Template.bind({});
Example.args = {};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};
