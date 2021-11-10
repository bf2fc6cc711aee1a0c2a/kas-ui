import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { IncomingOutgoingBytesPerTopic } from './IncomingOutgoingBytesPerTopic';

export default {
  title: 'Metrics/Components/IncomingOutgoingBytesPerTopic',
  component: IncomingOutgoingBytesPerTopic,
  args: {
    kafkaID: 'abc',
    topicList: [],
    incomingTopicsData: [],
    outgoingTopicsData: [],
    timeDuration: 6,
    timeInterval: 60,
    metricsDataUnavailable: false,
    isLoading: false,
    selectedTopic: false,
  },
} as ComponentMeta<typeof IncomingOutgoingBytesPerTopic>;

const Template: ComponentStory<typeof IncomingOutgoingBytesPerTopic> = (
  args
) => <IncomingOutgoingBytesPerTopic {...args} />;

export const NoData = Template.bind({});
NoData.args = {};

export const Loading = Template.bind({});
Loading.args = {
  isLoading: true,
};

export const NoMetrics = Template.bind({});
NoMetrics.args = {
  metricsDataUnavailable: true,
};

const sampleIncomingData = [
  { timestamp: 1636546066048, bytes: [3, 2, 5] },
  { timestamp: 1636546166048, bytes: [1, 4, 8] },
  { timestamp: 1636546266048, bytes: [1, 2, 3] },
  { timestamp: 1636546366048, bytes: [9, 0, 2] },
];
const sampleOutgoingData = [
  { timestamp: 1636546066048, bytes: [1, 2, 3] },
  { timestamp: 1636546166048, bytes: [9, 0, 2] },
  { timestamp: 1636546266048, bytes: [3, 2, 5] },
  { timestamp: 1636546366048, bytes: [1, 4, 8] },
];

export const SampleData = Template.bind({});
SampleData.args = {
  topicList: ['lorem', 'dolor', 'ipsum'],
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
};

export const SampleDataFiltered = Template.bind({});
SampleDataFiltered.args = {
  topicList: ['lorem', 'dolor', 'ipsum'],
  selectedTopic: 'lorem',
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
};
