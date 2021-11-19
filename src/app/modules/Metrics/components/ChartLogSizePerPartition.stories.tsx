import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { ChartLogSizePerPartition } from './ChartLogSizePerPartition';

export default {
  title: 'Metrics/Components/ChartLogSizePerPartition',
  component: ChartLogSizePerPartition,
  args: {
    partitions: {
      'partition 1': {
        '1636546066048': 44,
        '1636546166048': 44,
        '1636546266048': 96,
        '1636546366048': 608,
        '1636546466048': 32,
      },
      'partition 2': {
        '1636546066048': 789,
        '1636546166048': 789,
        '1636546266048': 789,
        '1636546366048': 8789,
        '1636546466048': 789,
      },
    },
  },
} as ComponentMeta<typeof ChartLogSizePerPartition>;

const Template: ComponentStory<typeof ChartLogSizePerPartition> = (args) => (
  <ChartLogSizePerPartition {...args} />
);

export const Story = Template.bind({});
Story.args = {};
