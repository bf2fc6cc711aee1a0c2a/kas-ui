import { rest } from 'msw';

import mock_topics from './topics.json';
import mock_disk_space from './disk_space.json';
import mock_10080_minutes from './10080_minutes.json';
import mock_15_minutes from './15_minutes.json';
import mock_180_minutes from './180_minutes.json';
import mock_2800_minutes from './2800_minutes.json';
import mock_30_minutes from './30_minutes.json';
import mock_360_minutes from './360_minutes.json';
import mock_5_minutes from './5_minutes.json';
import mock_60_minutes from './60_minutes.json';
import mock_720_minutes from './720_minutes.json';

const kafkaExistsMetricsMapping = {
  '10080': mock_10080_minutes,
  '15': mock_15_minutes,
  '180': mock_180_minutes,
  '2800': mock_2800_minutes,
  '30': mock_30_minutes,
  '360': mock_360_minutes,
  '5': mock_5_minutes,
  '60': mock_60_minutes,
  '720': mock_720_minutes,
};

export const kafkaExistsMsw = [
  rest.get('http://localhost/rest/topics', (req, res, ctx) => {
    return res(ctx.json(mock_topics));
  }),
  rest.get(
    'https://api.openshift.com/api/kafkas_mgmt/v1/kafkas/abc/metrics/query_range',
    (req, res, ctx) => {
      const duration = req.url.searchParams.get('duration') || '5';
      const filters = req.url.searchParams.get('filters');
      switch (filters) {
        case 'kubelet_volume_stats_used_bytes':
          return res(ctx.delay(500), ctx.json(mock_disk_space));
        default:
          return res(
            ctx.delay(500),
            ctx.json(kafkaExistsMetricsMapping[duration])
          );
      }
    }
  ),
];
