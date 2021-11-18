import { rest } from 'msw';

import mock_topics from './topics.json';
import mock_disk_space from './disk_space.json';
import mock_metrics from './metrics.json';

export const topicsJustCreated = [
  rest.get('http://localhost/rest/topics', (req, res, ctx) => {
    return res(ctx.json(mock_topics));
  }),
  rest.get(
    'https://api.openshift.com/api/kafkas_mgmt/v1/kafkas/abc/metrics/query_range',
    (req, res, ctx) => {
      const filters = req.url.searchParams.get('filters');
      switch (filters) {
        case 'kubelet_volume_stats_used_bytes':
          return res(ctx.delay(500), ctx.json(mock_disk_space));
        default:
          return res(ctx.delay(500), ctx.json(mock_metrics));
      }
    }
  ),
];
