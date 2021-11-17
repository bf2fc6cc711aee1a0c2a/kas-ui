import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { IncomingOutgoingBytesPerTopic } from './IncomingOutgoingBytesPerTopic';

export default {
  title: 'Metrics/Components/IncomingOutgoingBytesPerTopic',
  component: IncomingOutgoingBytesPerTopic,
  args: {
    topics: [],
    incomingTopicsData: [],
    outgoingTopicsData: [],
    partitions: [],
    timeDuration: 3,
    metricsDataUnavailable: false,
    isLoading: false,
    selectedTopic: undefined,
  },
} as ComponentMeta<typeof IncomingOutgoingBytesPerTopic>;

const Template: ComponentStory<typeof IncomingOutgoingBytesPerTopic> = (
  args
) => <IncomingOutgoingBytesPerTopic {...args} />;

export const NoData = Template.bind({});
NoData.args = {};

export const InitialLoading = Template.bind({});
InitialLoading.args = {
  isLoading: true,
};

export const NoMetrics = Template.bind({});
NoMetrics.args = {
  metricsDataUnavailable: true,
};

const sampleIncomingData = [
  { timestamp: 1636546066048, bytes: 70 },
  { timestamp: 1636546166048, bytes: 920 },
  { timestamp: 1636546266048, bytes: null },
  { timestamp: 1636546366048, bytes: 510 },
  { timestamp: 1636546466048, bytes: 361 },
];
const sampleOutgoingData = [
  { timestamp: 1636546066048, bytes: 230 },
  { timestamp: 1636546166048, bytes: 102 },
  { timestamp: 1636546266048, bytes: 41 },
  { timestamp: 1636546366048, bytes: 476 },
  { timestamp: 1636546466048, bytes: 276 },
];

export const SampleData = Template.bind({});
SampleData.args = {
  topics: ['lorem', 'dolor', 'ipsum'],
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
};

export const LoadingSelectedTopic = Template.bind({});
LoadingSelectedTopic.args = {
  topics: ['lorem', 'dolor', 'ipsum'],
  selectedTopic: 'lorem',
  isLoading: true,
};

export const SampleDataWithSelectedTopic = Template.bind({});
SampleDataWithSelectedTopic.args = {
  topics: ['lorem', 'dolor', 'ipsum'],
  selectedTopic: 'lorem',
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
  partitions: [
    {
      name: 'dolor partition 1',
      data: [
        { timestamp: 1636546066048, bytes: 3 },
        { timestamp: 1636546166048, bytes: 1 },
        { timestamp: 1636546266048, bytes: 1 },
        { timestamp: 1636546366048, bytes: 9 },
      ],
    },
    {
      name: 'dolor partition 2',
      data: [
        { timestamp: 1636546066048, bytes: 7 },
        { timestamp: 1636546166048, bytes: 4 },
        { timestamp: 1636546266048, bytes: 8 },
        { timestamp: 1636546366048, bytes: 3 },
      ],
    },
    {
      name: 'dolor partition 3',
      data: [
        { timestamp: 1636546066048, bytes: 2 },
        { timestamp: 1636546166048, bytes: 6 },
        { timestamp: 1636546266048, bytes: 5 },
        { timestamp: 1636546366048, bytes: 4 },
      ],
    },
  ],
};
