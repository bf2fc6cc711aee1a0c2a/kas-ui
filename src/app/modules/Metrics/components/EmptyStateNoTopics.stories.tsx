import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoTopics } from './EmptyStateNoTopics';

export default {
  title: 'Metrics/Empty states/No topics',
  component: EmptyStateNoTopics,
  args: {},
} as ComponentMeta<typeof EmptyStateNoTopics>;

const Template: ComponentStory<typeof EmptyStateNoTopics> = (args) => (
  <EmptyStateNoTopics {...args} />
);

export const Story = Template.bind({});
Story.args = {};
Story.storyName = 'No topics';
