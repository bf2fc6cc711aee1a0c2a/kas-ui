import { useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { useMachine } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { createModel } from 'xstate/lib/model';
import {
  BasicApiConfigurationParameters,
  fetchMetricsAndTopics,
  PartitionBytesMetric,
  TotalBytesMetrics,
} from './Metrics.api';

const MAX_RETRIES = 3;

type FetchSuccessProps = {
  kafkaTopics: string[];
  metricsTopics: string[];
  bytesOutgoing: TotalBytesMetrics;
  bytesIncoming: TotalBytesMetrics;
  bytesPerPartition: PartitionBytesMetric;
};

const model = createModel(
  {
    // context that needs to be provided by the consumer of the machine
    kafkaId: undefined as unknown as string,
    accessToken: undefined as BasicApiConfigurationParameters['accessToken'],
    basePath: undefined as BasicApiConfigurationParameters['basePath'],

    // from the UI elements
    selectedTopic: undefined as string | undefined,
    timeDuration: 60,

    // from the api
    kafkaTopics: [] as string[],
    metricsTopics: [] as string[],
    bytesOutgoing: {} as TotalBytesMetrics,
    bytesIncoming: {} as TotalBytesMetrics,
    bytesPerPartition: {} as PartitionBytesMetric,

    // how many time did we try a fetch (that combines more api)
    fetchFailures: 0 as number,
  },
  {
    events: {
      // called when a new kafka id has been specified
      fetch: () => ({}),
      fetchSuccess: (value: FetchSuccessProps) => ({ ...value }),
      fetchFail: () => ({}),

      // to refresh the data
      refresh: () => ({}),

      // from the UI elements
      selectTopic: (topic: string | undefined) => ({
        selectedTopic: topic,
      }),
      selectDuration: (duration: number) => ({
        timeDuration: duration,
      }),
    },
  }
);

const setTopics = model.assign((_, event) => {
  const {
    kafkaTopics,
    metricsTopics,
    bytesPerPartition: partitionsBytes,
    bytesOutgoing: totalBytes,
  } = event;
  return {
    kafkaTopics,
    metricsTopics,
    bytesPerPartition: partitionsBytes,
    bytesOutgoing: totalBytes,
  };
}, 'fetchSuccess');

const incrementRetries = model.assign(
  {
    fetchFailures: (context) => context.fetchFailures + 1,
  },
  'fetchFail'
);

const resetRetries = model.assign(
  {
    fetchFailures: () => 0,
  },
  'refresh'
);

const setTopic = model.assign(
  {
    selectedTopic: (_, event) => event.selectedTopic,
  },
  'selectTopic'
);

const topicsMachine = model.createMachine(
  {
    id: 'topics',
    context: model.initialContext,
    initial: 'callApi',
    states: {
      callApi: {
        tags: 'loading',
        initial: 'loading',
        states: {
          loading: {
            invoke: {
              src: 'api',
            },
            on: {
              fetchSuccess: {
                actions: setTopics,
                target: '#topics.verifyData',
              },
              fetchFail: {
                actions: incrementRetries,
                target: 'failure',
              },
            },
          },
          failure: {
            after: {
              1000: [
                { cond: 'canRetryFetching', target: 'loading' },
                { target: '#topics.criticalFail' },
              ],
            },
          },
        },
      },
      criticalFail: {
        tags: 'failed',
        on: {
          refresh: {
            actions: resetRetries,
            target: 'callApi',
          },
        },
      },
      verifyData: {
        always: [
          { cond: 'hasTopics', target: 'withTopics' },
          { target: 'noData' },
        ],
      },
      noData: {
        tags: 'no-data',
        on: {
          refresh: {
            actions: resetRetries,
            target: 'callApi',
          },
        },
      },
      withTopics: {
        on: {
          refresh: {
            target: 'refreshing',
          },
          selectTopic: {
            actions: setTopic,
            target: 'callApi',
          },
        },
      },
      refreshing: {
        invoke: {
          src: 'api',
        },
        on: {
          fetchSuccess: {
            actions: setTopics,
            target: 'withTopics',
          },
          fetchFail: {
            // 👀 we silently ignore this happened and go back to withTopics state
            target: 'withTopics',
          },
        },
      },
    },
  },
  {
    guards: {
      canRetryFetching: (context) => context.fetchFailures < MAX_RETRIES,
      hasTopics: (context) =>
        context.kafkaTopics.length > 0 || context.metricsTopics.length > 0,
    },
    services: {
      api: (context) => {
        return (callback) => {
          fetchMetricsAndTopics({
            kafkaId: context.kafkaId,
            selectedTopic: context.selectedTopic,
            timeDuration: context.timeDuration,
            timeInterval: 60, // TODO: fix this
            accessToken: context.accessToken,
            basePath: context.basePath,
          })
            .then((results) => callback(model.events.fetchSuccess(results)))
            .catch((e) => {
              console.error('Failed fetching data', e);
              callback(model.events.fetchFail());
            });
        };
      },
    },
  }
);

export function useTopics(kafkaId: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  const [state, send] = useMachine(
    topicsMachine.withContext({
      ...model.initialContext,
      accessToken: auth.kas.getToken(),
      basePath,
      kafkaId,
    }),
    {
      devTools: true,
    }
  );

  const {
    selectedTopic,
    timeDuration,
    kafkaTopics,
    metricsTopics,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
  } = state.context;

  const onTopicChange = useCallback(
    (topic: string | undefined) => send(model.events.selectTopic(topic)),
    [send]
  );

  const onDurationChange = useCallback(
    (duration: number) => send(model.events.selectDuration(duration)),
    [send]
  );

  const onRefresh = useCallback(() => send(model.events.refresh()), [send]);

  const mergedTopics = useMemo((): string[] => {
    const topics = Array.from(
      new Set<string>([...kafkaTopics, ...metricsTopics])
    );
    topics.sort((a, b) => a.localeCompare(b));
    return topics;
  }, [kafkaTopics, metricsTopics]);

  return {
    isLoading: state.hasTag('loading'),
    isFailed: state.hasTag('failed'),
    isDataUnavailable: state.hasTag('no-data'),
    topics: mergedTopics,
    selectedTopic,
    timeDuration,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
    onTopicChange,
    onDurationChange,
    onRefresh,
  };
}
