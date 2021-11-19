import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { ToolbarUsedDiskSpace } from "./ToolbarUsedDiskSpace";

export default {
  title: "Metrics/Components/ToolbarUsedDiskSpace",
  component: ToolbarUsedDiskSpace,
  controls: {},
  args: {
    title: "Sample title",
    topicList: ["lorem", "dolor", "ipsum"],
    isDisabled: false,
  },
} as ComponentMeta<typeof ToolbarUsedDiskSpace>;

const Template: ComponentStory<typeof ToolbarUsedDiskSpace> = (args) => (
  <ToolbarUsedDiskSpace {...args} />
);

export const Example = Template.bind({});
Example.args = {};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};

export const Refreshing = Template.bind({});
Refreshing.args = {
  isRefreshing: true,
};
