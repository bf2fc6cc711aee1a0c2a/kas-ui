import { ComponentStory, ComponentMeta } from "@storybook/react";
import { OwnerSelect } from "./OwnerSelect";

export default {
  title: "TransferOwnership/OwnerSelect",
  component: OwnerSelect,
  args: {
    allUsers: [
      { id: "Suyash", displayName: "snaithan" },
      { id: "kafkaId", displayName: "kafkaName" },
    ],
  },
} as ComponentMeta<typeof OwnerSelect>;

const Template: ComponentStory<typeof OwnerSelect> = (args) => (
  <OwnerSelect {...args} />
);

export const Story1 = Template.bind({});
Story1.args = {};
Story1.storyName = "Change owner select";
