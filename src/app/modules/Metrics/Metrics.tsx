import {
  TopicsMetricsCard,
  InitialLoadingEmptyState,
  MetricsUnavailableEmptyState,
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

export const Metrics: React.FC<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  return (
    <MetricsProvider kafkaId={kafkaId} onCreateTopic={onCreateTopic}>
      <ConnectedMetrics />
    </MetricsProvider>
  );
};

const ConnectedMetrics: FunctionComponent = () => {
  const { isLoading, isDataUnavailable } = useDiskSpace();

  switch (true) {
    case isLoading:
      return <InitialLoadingEmptyState />;
    case isDataUnavailable:
      return <MetricsUnavailableEmptyState />;
  }
  return (
    <MetricsLayout
      diskSpaceMetrics={<ConnectedDiskMetrics />}
      topicMetrics={<ConnectedTopicsMetrics />}
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

const ConnectedTopicsMetrics: FunctionComponent = () => {
  const {
    isLoading,
    isRefreshing,
    isDataUnavailable,
    isFailed,
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
      onCreateTopic={() => false}
    />
  );
};
