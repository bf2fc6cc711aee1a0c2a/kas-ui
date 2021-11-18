import { TotalBytesMetrics } from "@app/modules/Metrics";
import { createModel } from "xstate/lib/model";
import { DurationOptions } from "../components/FilterByTime";

const MAX_RETRIES = 3;

type FetchSuccessProps = {
  metrics: TotalBytesMetrics;
};

export const DiskSpaceMetricsModel = createModel(
  {
    // from the UI elements
    timeDuration: 60 as DurationOptions,

    // from the api
    metrics: {} as TotalBytesMetrics,
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

const setMetrics = DiskSpaceMetricsModel.assign((_, event) => {
  const { metrics } = event;
  return {
    metrics,
  };
}, "fetchSuccess");

const incrementRetries = DiskSpaceMetricsModel.assign(
  {
    fetchFailures: (context) => context.fetchFailures + 1,
  },
  "fetchFail"
);

const resetRetries = DiskSpaceMetricsModel.assign(
  {
    fetchFailures: () => 0,
  },
  "refresh"
);

const setDuration = DiskSpaceMetricsModel.assign(
  {
    timeDuration: (_, event) => event.timeDuration,
  },
  "selectDuration"
);

export const DiskSpaceMetricsMachine = DiskSpaceMetricsModel.createMachine(
  {
    id: "diskSpace",
    context: DiskSpaceMetricsModel.initialContext,
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
                actions: setMetrics,
                target: "#diskSpace.verifyData",
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
                { target: "#diskSpace.criticalFail" },
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
          { cond: "hasMetrics", target: "withMetrics" },
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
      withMetrics: {
        on: {
          refresh: {
            target: "refreshing",
          },
          selectDuration: {
            actions: setDuration,
            target: "refreshing",
          },
        },
      },
      refreshing: {
        tags: "refreshing",
        invoke: {
          src: "api",
        },
        on: {
          fetchSuccess: {
            actions: setMetrics,
            target: "withMetrics",
          },
          fetchFail: {
            // 👀 we silently ignore this happened and go back to withMetrics state
            target: "withMetrics",
          },
        },
      },
    },
  },
  {
    guards: {
      canRetryFetching: (context) => context.fetchFailures < MAX_RETRIES,
      hasMetrics: (context) => Object.keys(context.metrics).length > 0,
    },
  }
);

export type DiskSpaceMachineType = typeof DiskSpaceMetricsMachine;
