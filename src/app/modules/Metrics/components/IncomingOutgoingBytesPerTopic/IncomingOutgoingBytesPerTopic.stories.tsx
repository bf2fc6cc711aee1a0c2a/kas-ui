import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { IncomingOutgoingBytesPerTopic } from "./IncomingOutgoingBytesPerTopic";

export default {
  title: "Metrics/Components/IncomingOutgoingBytesPerTopic",
  component: IncomingOutgoingBytesPerTopic,
  args: {
    topicList: [],
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
  topicList: ["lorem", "dolor", "ipsum"],
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
};

export const LoadingSelectedTopic = Template.bind({});
LoadingSelectedTopic.args = {
  topicList: ["lorem", "dolor", "ipsum"],
  selectedTopic: "lorem",
  isLoading: true,
};

export const SampleDataWithSelectedTopic = Template.bind({});
SampleDataWithSelectedTopic.args = {
  topicList: ["lorem", "dolor", "ipsum"],
  selectedTopic: "lorem",
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
  partitions: [
    {
      name: "lorem",
      data: [
        { timestamp: 1636546066048, bytes: 3, name: "lorem 1" },
        { timestamp: 1636546166048, bytes: 1, name: "lorem 2" },
        { timestamp: 1636546266048, bytes: 1, name: "lorem 3" },
        { timestamp: 1636546366048, bytes: 9, name: "lorem 4" },
      ],
    },
    {
      name: "dolor",
      data: [
        { timestamp: 1636546066048, bytes: 7, name: "dolor 1" },
        { timestamp: 1636546166048, bytes: 4, name: "dolor 2" },
        { timestamp: 1636546266048, bytes: 8, name: "dolor 3" },
        { timestamp: 1636546366048, bytes: 3, name: "dolor 4" },
      ],
    },
    {
      name: "ipsum",
      data: [
        { timestamp: 1636546066048, bytes: 2, name: "ipsum 1" },
        { timestamp: 1636546166048, bytes: 6, name: "ipsum 2" },
        { timestamp: 1636546266048, bytes: 5, name: "ipsum 3" },
        { timestamp: 1636546366048, bytes: 4, name: "ipsum 4" },
      ],
    },
  ],
};
