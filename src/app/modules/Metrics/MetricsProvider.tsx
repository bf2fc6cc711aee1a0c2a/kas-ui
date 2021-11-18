import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { useInterpret, useSelector } from "@xstate/react";
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { InterpreterFrom } from "xstate";
import { DurationOptions } from "./components/ChartToolbar/FilterByTime";
import {
  TopicMetricsMachineType,
  TopicsMetricsMachine,
  TopicsMetricsModel,
} from "./machines";
import { fetchMetricsAndTopics } from "./MetricsApi";

type MetricsContextProps = {
  kafkaId: string;
  onCreateTopic: () => void;
  topicsMetricsMachineService: InterpreterFrom<TopicMetricsMachineType>;
};
const MetricsContext = createContext<MetricsContextProps>(null!);

type MetricsProviderProps = {
  kafkaId: string;
  onCreateTopic: () => void;
};

export const MetricsProvider: FunctionComponent<MetricsProviderProps> = ({
  kafkaId,
  onCreateTopic,
  children,
}) => {
  const topicsMetricsMachineService = useTopicsMetricsMachineService(kafkaId);
  return (
    <MetricsContext.Provider
      value={{ kafkaId, topicsMetricsMachineService, onCreateTopic }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

export function useTopics() {
  const { topicsMetricsMachineService: service } = useContext(MetricsContext);

  const selector = useCallback(
    (state: typeof service.state) => ({
      ...state.context,
      isLoading: state.hasTag("loading"),
      isFailed: state.hasTag("failed"),
      isDataUnavailable: state.hasTag("no-data"),
    }),
    []
  );
  const {
    selectedTopic,
    timeDuration,
    kafkaTopics,
    metricsTopics,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
    isLoading,
    isDataUnavailable,
    isFailed,
  } = useSelector(service, selector);

  const onTopicChange = useCallback(
    (topic: string | undefined) =>
      service.send(TopicsMetricsModel.events.selectTopic(topic)),
    [service]
  );

  const onDurationChange = useCallback(
    (duration: DurationOptions) =>
      service.send(TopicsMetricsModel.events.selectDuration(duration)),
    [service]
  );

  const onRefresh = useCallback(
    () => service.send(TopicsMetricsModel.events.refresh()),
    [service]
  );

  const mergedTopics = useMemo((): string[] => {
    const topics = Array.from(
      new Set<string>([...kafkaTopics, ...metricsTopics])
    );
    topics.sort((a, b) => a.localeCompare(b));
    return topics;
  }, [kafkaTopics, metricsTopics]);

  return {
    isLoading,
    isFailed,
    isDataUnavailable,
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

function useTopicsMetricsMachineService(kafkaId: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  return useInterpret(
    TopicsMetricsMachine.withConfig({
      services: {
        api: (context) => {
          return (callback) => {
            fetchMetricsAndTopics({
              kafkaId: kafkaId,
              selectedTopic: context.selectedTopic,
              timeDuration: context.timeDuration,
              timeInterval: 60, // TODO: fix this
              accessToken: auth.kas.getToken(),
              basePath: basePath,
            })
              .then((results) =>
                callback(TopicsMetricsModel.events.fetchSuccess(results))
              )
              .catch((e) => {
                console.error("Failed fetching data", e);
                callback(TopicsMetricsModel.events.fetchFail());
              });
          };
        },
      },
    }),
    {
      devTools: true,
    }
  );
}
