import {
  IncomingOutgoingBytesPerTopic,
  UsedDiskSpaceChart,
} from "@app/modules/Metrics/components";
import React, { FunctionComponent } from "react";
import { MetricsLayout } from "./components";
import { MetricsProvider, useTopics } from "./MetricsProvider";

export interface MetricsProps {
  kafkaId: string;
  onCreateTopic: () => void;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  return (
    <MetricsProvider kafkaId={kafkaId} onCreateTopic={onCreateTopic}>
      <MetricsLayout
        diskSpaceMetrics={<ConnectedDiskMetrics />}
        topicMetrics={<ConnectedTopicsMetrics />}
      />
    </MetricsProvider>
  );
};

const ConnectedDiskMetrics: FunctionComponent = () => {
  return (
    <UsedDiskSpaceChart
      kafkaID={"kafkaId"}
      metricsDataUnavailable={false}
      setMetricsDataUnavailable={() => false}
    />
  );
};

const ConnectedTopicsMetrics: FunctionComponent = () => {
  const {
    isLoading,
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
    <IncomingOutgoingBytesPerTopic
      metricsDataUnavailable={isDataUnavailable}
      topics={topics}
      incomingTopicsData={bytesIncoming}
      outgoingTopicsData={bytesOutgoing}
      partitions={bytesPerPartition}
      timeDuration={timeDuration}
      isLoading={isLoading}
      selectedTopic={selectedTopic}
      onRefresh={onRefresh}
      onSelectedTopic={onTopicChange}
      onTimeDuration={onDurationChange}
      onCreateTopic={() => false}
    />
  );
};
