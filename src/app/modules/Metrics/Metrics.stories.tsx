import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";
import { Metrics } from "./Metrics";
import { instanceJustCreated } from "./mocks/instance-just-created/msw";

import { kafkaExistsMsw } from "./mocks/kafka-exists-and-used/msw";

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

export const Story1 = Template.bind({});
Story1.args = {};
Story1.storyName = "Kafka just created";
Story1.parameters = {
  msw: instanceJustCreated,
};

export const Story2 = Template.bind({});
Story2.args = {};
Story2.storyName = "Kafka exists but no topics created";

export const Story3 = Template.bind({});
Story3.args = {};
Story3.storyName = "Topics just created";

export const Story4 = Template.bind({});
Story4.args = {};
Story4.storyName = "Kafka and topics exist and are in use";
Story4.parameters = {
  msw: kafkaExistsMsw,
};

export const Story5 = Template.bind({});
Story5.args = {};
Story5.storyName = "Limits have been reached ";
