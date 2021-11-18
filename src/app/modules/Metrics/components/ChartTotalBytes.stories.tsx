import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { ChartTotalBytes } from "./ChartTotalBytes";

export default {
  title: "Metrics/Components/ChartTotalBytes",
  component: ChartTotalBytes,
  args: {
    incomingTopicsData: {
      "1636546066048": 44,
      "1636546166048": 44,
      "1636546266048": 96,
      "1636546366048": 608,
      "1636546466048": 32,
    },
    outgoingTopicsData: {
      "1636546066048": 44789,
      "1636546166048": 44789,
      "1636546266048": 96789,
      "1636546366048": 608789,
      "1636546466048": 32789,
    },
    timeDuration: 5,
  },
} as ComponentMeta<typeof ChartTotalBytes>;

const Template: ComponentStory<typeof ChartTotalBytes> = (args) => (
  <ChartTotalBytes {...args} />
);

export const Story = Template.bind({});
Story.args = {};
