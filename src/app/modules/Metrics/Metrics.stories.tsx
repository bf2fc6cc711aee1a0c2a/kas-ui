import { ComponentStory, ComponentMeta } from "@storybook/react";
import React from "react";
import { Metrics } from "./Metrics";

import { rest } from "msw";
import mock_topics from "./mocks/topics.json";
import mock_disk_space from "./mocks/disk_space.json";
import mock_10080_minutes from "./mocks/10080_minutes.json";
import mock_15_minutes from "./mocks/15_minutes.json";
import mock_180_minutes from "./mocks/180_minutes.json";
import mock_2800_minutes from "./mocks/2800_minutes.json";
import mock_30_minutes from "./mocks/30_minutes.json";
import mock_360_minutes from "./mocks/360_minutes.json";
import mock_5_minutes from "./mocks/5_minutes.json";
import mock_60_minutes from "./mocks/60_minutes.json";
import mock_720_minutes from "./mocks/720_minutes.json";

const metricsMapping = {
  "10080": mock_10080_minutes,
  "15": mock_15_minutes,
  "180": mock_180_minutes,
  "2800": mock_2800_minutes,
  "30": mock_30_minutes,
  "360": mock_360_minutes,
  "5": mock_5_minutes,
  "60": mock_60_minutes,
  "720": mock_720_minutes,
};

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
  msw: [
    rest.get("http://localhost/rest/topics", (req, res, ctx) => {
      return res(ctx.json(mock_topics));
    }),
    rest.get(
      "https://api.openshift.com/api/kafkas_mgmt/v1/kafkas/abc/metrics/query_range",
      (req, res, ctx) => {
        const duration = req.url.searchParams.get("duration") || "5";
        const filters = req.url.searchParams.get("filters");
        console.log(filters);
        switch (filters) {
          case "kubelet_volume_stats_used_bytes":
            return res(ctx.json(mock_disk_space));
          default:
            return res(ctx.json(metricsMapping[duration]));
        }
      }
    ),
  ],
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

export const Story5 = Template.bind({});
Story5.args = {};
Story5.storyName = "Limits have been reached ";
