import { Card, CardBody, CardTitle, TextContent } from "@patternfly/react-core";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";

import { MetricsLayout } from "./MetricsLayout";

const SampleCard = (
  <Card>
    <CardTitle>Lorem dolor</CardTitle>
    <CardBody>
      <TextContent>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam
          perferendis animi maxime distinctio mollitia quo excepturi provident
          cum neque. Enim quos minima ipsa hic error repudiandae laboriosam
          dolorum pariatur beatae.
        </p>
      </TextContent>
    </CardBody>
  </Card>
);

export default {
  title: "Metrics/Components/MetricsLayout",
  component: MetricsLayout,
  args: {},
} as ComponentMeta<typeof MetricsLayout>;

const Template: ComponentStory<typeof MetricsLayout> = (args) => (
  <MetricsLayout {...args} />
);

export const Layout = Template.bind({});
Layout.args = {
  diskSpaceMetrics: SampleCard,
  topicMetrics: SampleCard,
};
