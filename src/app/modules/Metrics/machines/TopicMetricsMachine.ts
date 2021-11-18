import { createModel } from "xstate/lib/model";
import { DurationOptions } from "../components/ChartToolbar/FilterByTime";
import {
  fetchMetricsAndTopics,
  PartitionBytesMetric,
  TotalBytesMetrics,
} from "../MetricsApi";

const MAX_RETRIES = 3;

type FetchSuccessProps = {
  kafkaTopics: string[];
  metricsTopics: string[];
  bytesOutgoing: TotalBytesMetrics;
  bytesIncoming: TotalBytesMetrics;
  bytesPerPartition: PartitionBytesMetric;
};

export const TopicsMetricsModel = createModel(
  {
    // from the UI elements
    selectedTopic: undefined as string | undefined,
    timeDuration: 60 as DurationOptions,

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
      selectDuration: (duration: DurationOptions) => ({
        timeDuration: duration,
      }),
    },
  }
);

const setTopics = TopicsMetricsModel.assign((_, event) => {
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
}, "fetchSuccess");

const incrementRetries = TopicsMetricsModel.assign(
  {
    fetchFailures: (context) => context.fetchFailures + 1,
  },
  "fetchFail"
);

const resetRetries = TopicsMetricsModel.assign(
  {
    fetchFailures: () => 0,
  },
  "refresh"
);

const setTopic = TopicsMetricsModel.assign(
  {
    selectedTopic: (_, event) => event.selectedTopic,
  },
  "selectTopic"
);

const setDuration = TopicsMetricsModel.assign(
  {
    timeDuration: (_, event) => event.timeDuration,
  },
  "selectDuration"
);

export const TopicsMetricsMachine = TopicsMetricsModel.createMachine(
  {
    id: "topics",
    context: TopicsMetricsModel.initialContext,
    initial: "callApi",
    states: {
      callApi: {
        tags: "loading",
        initial: "loading",
        states: {
          loading: {
            invoke: {
              src: "api",
            },
            on: {
              fetchSuccess: {
                actions: setTopics,
                target: "#topics.verifyData",
              },
              fetchFail: {
                actions: incrementRetries,
                target: "failure",
              },
            },
          },
          failure: {
            after: {
              1000: [
                { cond: "canRetryFetching", target: "loading" },
                { target: "#topics.criticalFail" },
              ],
            },
          },
        },
      },
      criticalFail: {
        tags: "failed",
        on: {
          refresh: {
            actions: resetRetries,
            target: "callApi",
          },
        },
      },
      verifyData: {
        always: [
          { cond: "hasTopics", target: "withTopics" },
          { target: "noData" },
        ],
      },
      noData: {
        tags: "no-data",
        on: {
          refresh: {
            actions: resetRetries,
            target: "callApi",
          },
        },
      },
      withTopics: {
        on: {
          refresh: {
            target: "refreshing",
          },
          selectTopic: {
            actions: setTopic,
            target: "callApi",
          },
          selectDuration: {
            actions: setDuration,
            target: "callApi",
          },
        },
      },
      refreshing: {
        invoke: {
          src: "api",
        },
        on: {
          fetchSuccess: {
            actions: setTopics,
            target: "withTopics",
          },
          fetchFail: {
            // 👀 we silently ignore this happened and go back to withTopics state
            target: "withTopics",
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
  }
);

export type TopicMetricsMachineType = typeof TopicsMetricsMachine;
