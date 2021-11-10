import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { UsedDiskSpaceToolbar } from "./UsedDiskSpaceToolbar";

export default {
  title: "Metrics/Components/UsedDiskSpaceToolbar",
  component: UsedDiskSpaceToolbar,
  controls: {},
  args: {
    title: "Sample title",
    topicList: ["lorem", "dolor", "ipsum"],
    isDisabled: false,
  },
} as ComponentMeta<typeof UsedDiskSpaceToolbar>;

const Template: ComponentStory<typeof UsedDiskSpaceToolbar> = (args) => (
  <UsedDiskSpaceToolbar {...args} />
);

export const Example = Template.bind({});
Example.args = {};

export const Disabled = Template.bind({});
Disabled.args = {
  isDisabled: true,
};
