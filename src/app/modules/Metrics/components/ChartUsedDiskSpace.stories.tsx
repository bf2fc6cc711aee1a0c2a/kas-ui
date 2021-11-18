import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { ChartUsedDiskSpace } from "./ChartUsedDiskSpace";

export default {
  title: "Metrics/Components/ChartUsedDiskSpace",
  component: ChartUsedDiskSpace,
  args: {
    metrics: {
      "1636546066048": 74297344789,
      "1636546166048": 74502144789,
      "1636546266048": 119756096789,
      "1636546366048": 119948608789,
      "1636546466048": 75231232789,
    },
    timeDuration: 5,
  },
} as ComponentMeta<typeof ChartUsedDiskSpace>;

const Template: ComponentStory<typeof ChartUsedDiskSpace> = (args) => (
  <ChartUsedDiskSpace {...args} />
);

export const Story = Template.bind({});
Story.args = {};
