import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { CardUsedDiskSpace } from './CardUsedDiskSpace';

export default {
  title: 'Metrics/Components/CardUsedDiskSpace',
  component: CardUsedDiskSpace,
  args: {
    metrics: {},
    timeDuration: 5,
    metricsDataUnavailable: false,
    isLoading: false,
    isRefreshing: false,
  },
} as ComponentMeta<typeof CardUsedDiskSpace>;

const Template: ComponentStory<typeof CardUsedDiskSpace> = (args) => (
  <CardUsedDiskSpace {...args} />
);

export const InitialLoading = Template.bind({});
InitialLoading.args = {
  isLoading: true,
};

export const NoMetrics = Template.bind({});
NoMetrics.args = {
  metricsDataUnavailable: true,
};

export const SampleData = Template.bind({});
SampleData.args = {
  metrics: {
    '1636546066048': 74297344789,
    '1636546166048': 74502144789,
    '1636546266048': 119756096789,
    '1636546366048': 119948608789,
    '1636546466048': 75231232789,
  },
};

export const OverLimits = Template.bind({});
OverLimits.args = {
  metrics: {
    '1636546066048': 742973447891,
    '1636546166048': 745021447891,
    '1636546266048': 1397560967891,
    '1636546366048': 1219486087891,
    '1636546466048': 752312327891,
  },
};
