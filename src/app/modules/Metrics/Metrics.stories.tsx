import { ComponentStory, ComponentMeta } from '@storybook/react';
import React from 'react';

import { Metrics } from './Metrics';

export default {
  title: 'Metrics/Metrics',
  component: Metrics,
  args: {
    kafkaId: 'abc',
  },
} as ComponentMeta<typeof Metrics>;

const Template: ComponentStory<typeof Metrics> = (args) => (
  <Metrics {...args} />
);

export const Story1 = Template.bind({});
Story1.args = {};
Story1.storyName = 'Kafka just created';

export const Story2 = Template.bind({});
Story2.args = {};
Story2.storyName = 'Kafka exists but no topics created';

export const Story3 = Template.bind({});
Story3.args = {};
Story3.storyName = 'Topics just created';

export const Story4 = Template.bind({});
Story4.args = {};
Story4.storyName = 'Kafka and topics exist and are in use';

export const Story5 = Template.bind({});
Story5.args = {};
Story5.storyName = 'Limits have been reached ';
