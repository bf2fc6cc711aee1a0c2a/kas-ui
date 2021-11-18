import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";
import { Metrics } from "./Metrics";
import { apiError } from "./mocks/api-error/msw";
import { instanceJustCreated } from "./mocks/instance-just-created/msw";
import { kafkaExistsMsw } from "./mocks/kafka-exists-and-used/msw";
import { topicsJustCreated } from "./mocks/topics-just-created/msw";

export default {
  title: "Metrics/Metrics",
  component: Metrics,
  args: {
    kafkaId: "abc",
  },
  parameters: {
    xstate: true,
    // this option is passed to the devTools instance to use a different inspector
    inspectUrl: "https://stately.ai/viz?inspect",
  },
} as ComponentMeta<typeof Metrics>;

const Template: ComponentStory<typeof Metrics> = (args) => (
  <Metrics {...args} />
);

export const ApiError = Template.bind({});
ApiError.args = {};
ApiError.storyName = "Kafka just created";
ApiError.parameters = {
  msw: apiError,
};

export const ApiEmpty = Template.bind({});
ApiEmpty.args = {};
ApiEmpty.storyName = "Kafka exists but no topics created";
ApiEmpty.parameters = {
  msw: instanceJustCreated,
};

export const TopicsJustCreated = Template.bind({});
TopicsJustCreated.args = {};
TopicsJustCreated.storyName = "Topics just created";
TopicsJustCreated.parameters = {
  msw: topicsJustCreated,
};

export const Story4 = Template.bind({});
Story4.args = {};
Story4.storyName = "Kafka and topics exist and are in use";
Story4.parameters = {
  msw: kafkaExistsMsw,
};

export const Story5 = Template.bind({});
Story5.args = {};
Story5.storyName = "Limits have been reached ";
