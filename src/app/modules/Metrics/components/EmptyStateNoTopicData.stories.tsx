import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoTopicData } from './EmptyStateNoTopicData';

export default {
  title: 'Metrics/Empty states/No topic data',
  component: EmptyStateNoTopicData,
  args: {},
} as ComponentMeta<typeof EmptyStateNoTopicData>;

const Template: ComponentStory<typeof EmptyStateNoTopicData> = (args) => (
  <EmptyStateNoTopicData {...args} />
);

export const Story = Template.bind({});
Story.args = {};
Story.storyName = 'No topic data';
