import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { EmptyStateNoTopicSelected } from './EmptyStateNoTopicSelected';

export default {
  title: 'Metrics/Empty states/No topic selected',
  component: EmptyStateNoTopicSelected,
} as ComponentMeta<typeof EmptyStateNoTopicSelected>;

const Template: ComponentStory<typeof EmptyStateNoTopicSelected> = () => (
  <EmptyStateNoTopicSelected />
);

export const Story = Template.bind({});
Story.args = {};
Story.storyName = 'No topic selected';
