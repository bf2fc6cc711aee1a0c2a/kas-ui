import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { FilterByTopic } from "./FilterByTopic";

export default {
  title: "Metrics/FilterByTopic",
  component: FilterByTopic,
  args: {
    setSelectedTopic: (value: string | boolean) => false,
    selectedTopic: undefined,
    topicList: ["lorem", "dolor", "ipsum"],
    setIsFilterApplied: (value: boolean) => false,
    disableToolbar: false,
  },
} as ComponentMeta<typeof FilterByTopic>;

const Template: ComponentStory<typeof FilterByTopic> = (args) => (
  <FilterByTopic {...args} />
);

export const Story = Template.bind({});
Story.args = {};
