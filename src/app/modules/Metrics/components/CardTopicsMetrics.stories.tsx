import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { CardTopicsMetrics } from "./CardTopicsMetrics";

export default {
  title: "Metrics/Components/CardTopicsMetrics",
  component: CardTopicsMetrics,
  args: {
    topics: [],
    incomingTopicsData: {},
    outgoingTopicsData: {},
    partitions: {},
    timeDuration: 15,
    metricsDataUnavailable: false,
    isLoading: false,
    isRefreshing: false,
    selectedTopic: undefined,
  },
} as ComponentMeta<typeof CardTopicsMetrics>;

const Template: ComponentStory<typeof CardTopicsMetrics> = (args) => (
  <CardTopicsMetrics {...args} />
);

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

const sampleIncomingData = {
  1636546066048: 70,
  1636546166048: 920,
  1636546266048: 23,
  1636546366048: 510,
  1636546466048: 361,
};
const sampleOutgoingData = {
  1636546066048: 230,
  1636546166048: 102,
  1636546266048: 41,
  1636546366048: 476,
  1636546466048: 276,
};

export const SampleData = Template.bind({});
SampleData.args = {
  topics: ["lorem", "dolor", "ipsum"],
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
};

export const LoadingSelectedTopic = Template.bind({});
LoadingSelectedTopic.args = {
  topics: ["lorem", "dolor", "ipsum"],
  selectedTopic: "lorem",
  isLoading: true,
};

export const SampleDataWithSelectedTopic = Template.bind({});
SampleDataWithSelectedTopic.args = {
  topics: ["lorem", "dolor", "ipsum"],
  selectedTopic: "lorem",
  incomingTopicsData: sampleIncomingData,
  outgoingTopicsData: sampleOutgoingData,
  partitions: {
    "dolor partition 1": {
      1636546066048: 3,
      1636546166048: 1,
      1636546266048: 1,
      1636546366048: 9,
    },
    "dolor partition 2": {
      1636546066048: 7,
      1636546166048: 4,
      1636546266048: 8,
      1636546366048: 3,
    },
    "dolor partition 3": {
      1636546066048: 2,
      1636546166048: 6,
      1636546266048: 5,
      1636546366048: 4,
    },
  },
};
