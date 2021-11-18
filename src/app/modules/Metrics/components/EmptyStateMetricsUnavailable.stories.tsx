import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateMetricsUnavailable } from './EmptyStateMetricsUnavailable';

export default {
  title: 'Metrics/Empty states/Metrics unavailable',
  component: EmptyStateMetricsUnavailable,
  args: {},
} as ComponentMeta<typeof EmptyStateMetricsUnavailable>;

const Template: ComponentStory<typeof EmptyStateMetricsUnavailable> = (
  args
) => <EmptyStateMetricsUnavailable {...args} />;

export const Story = Template.bind({});
Story.args = {};
Story.storyName = 'Metrics unavailable';
