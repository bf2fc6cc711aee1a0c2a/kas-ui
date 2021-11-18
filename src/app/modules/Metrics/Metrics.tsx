import {
  TopicsMetricsCard,
  EmptyStateInitialLoading,
  EmptyStateMetricsUnavailable,
  UsedDiskSpaceChart,
} from "@app/modules/Metrics/components";
import React, { FunctionComponent } from "react";
import { MetricsLayout } from "./components";
import { UsedDiskSpaceCard } from "./components/UsedDiskSpaceCard";
import { MetricsProvider } from "./MetricsProvider";
import { useDiskSpace } from "./useDiskSpace";
import { useTopics } from "./useTopics";

export interface MetricsProps {
  kafkaId: string;
  onCreateTopic: () => void;
}

export const Metrics: FunctionComponent<MetricsProps> = ({
  kafkaId,
  onCreateTopic,
}) => {
  return (
    <MetricsProvider kafkaId={kafkaId}>
      <ConnectedMetrics onCreateTopic={onCreateTopic} />
    </MetricsProvider>
  );
};

type ConnectedMetricsProps = {
  onCreateTopic: () => void;
};
const ConnectedMetrics: FunctionComponent<ConnectedMetricsProps> = ({
  onCreateTopic,
}) => {
  const { isLoading, isFailed } = useDiskSpace();

  switch (true) {
    case isLoading:
      return <EmptyStateInitialLoading />;
    case isFailed:
      return <EmptyStateMetricsUnavailable />;
  }
  return (
    <MetricsLayout
      diskSpaceMetrics={<ConnectedDiskMetrics />}
      topicMetrics={<ConnectedTopicsMetrics onCreateTopic={onCreateTopic} />}
    />
  );
};

const ConnectedDiskMetrics: FunctionComponent = () => {
  const {
    isLoading,
    isRefreshing,
    isDataUnavailable,
    isFailed,
    timeDuration,
    metrics,
    onDurationChange,
    onRefresh,
  } = useDiskSpace();

  return (
    <UsedDiskSpaceCard
      metrics={metrics}
      timeDuration={timeDuration}
      metricsDataUnavailable={isDataUnavailable || isFailed}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      onTimeDuration={onDurationChange}
    />
  );
};

type ConnectedTopicsMetricsProps = {
  onCreateTopic: () => void;
};
const ConnectedTopicsMetrics: FunctionComponent<ConnectedTopicsMetricsProps> =
  ({ onCreateTopic }) => {
    const {
      isLoading,
      isRefreshing,
      isFailed,
      isDataUnavailable,
      selectedTopic,
      timeDuration,
      topics,
      bytesIncoming,
      bytesOutgoing,
      bytesPerPartition,
      onDurationChange,
      onTopicChange,
      onRefresh,
    } = useTopics();

    return (
      <TopicsMetricsCard
        metricsDataUnavailable={isDataUnavailable || isFailed}
        topics={topics}
        incomingTopicsData={bytesIncoming}
        outgoingTopicsData={bytesOutgoing}
        partitions={bytesPerPartition}
        timeDuration={timeDuration}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        selectedTopic={selectedTopic}
        onRefresh={onRefresh}
        onSelectedTopic={onTopicChange}
        onTimeDuration={onDurationChange}
        onCreateTopic={onCreateTopic}
      />
    );
  };
