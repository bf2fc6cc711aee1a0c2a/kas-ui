import { useSelector } from "@xstate/react";
import { useCallback, useContext, useMemo } from "react";
import { DurationOptions } from "./components/FilterByTime";
import { TopicsMetricsModel } from "./machines";
import { MetricsContext } from "./MetricsProvider";

export function useTopicsMetrics() {
  const { topicsMetricsMachineService: service } = useContext(MetricsContext);

  const selector = useCallback(
    (state: typeof service.state) => ({
      ...state.context,
      isRefreshing: state.hasTag("refreshing"),
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
    isRefreshing,
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
    isRefreshing,
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
