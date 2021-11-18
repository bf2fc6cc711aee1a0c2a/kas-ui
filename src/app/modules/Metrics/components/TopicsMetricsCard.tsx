import {
  ChartEmptyState,
  ChartPopover,
  LogSizePerPartitionChart,
  TopicMetricsToolbar,
  TotalBytesChart,
} from "@app/modules/Metrics/components";
import {
  PartitionBytesMetric,
  TotalBytesMetrics,
} from "@app/modules/Metrics/MetricsApi";
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Spinner,
} from "@patternfly/react-core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { DurationOptions } from "./FilterByTime";

type TopicsMetricsCardProps = {
  topics: string[];
  incomingTopicsData: TotalBytesMetrics;
  outgoingTopicsData: TotalBytesMetrics;
  partitions: PartitionBytesMetric;
  timeDuration: DurationOptions;
  metricsDataUnavailable: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedTopic: string | undefined;
  onCreateTopic: () => void;
  onRefresh: () => void;
  onSelectedTopic: (topic: string | undefined) => void;
  onTimeDuration: (duration: DurationOptions) => void;
};

export const TopicsMetricsCard: FunctionComponent<TopicsMetricsCardProps> = ({
  topics,
  incomingTopicsData,
  outgoingTopicsData,
  selectedTopic,
  timeDuration,
  partitions,
  metricsDataUnavailable,
  isLoading,
  isRefreshing,
  onCreateTopic,
  onRefresh,
  onSelectedTopic,
  onTimeDuration,
}) => {
  const { t } = useTranslation();
  // const { addAlert } = useAlert() || {};
  const noTopics = topics.length === 0;

  return (
    <Card>
      <TopicMetricsToolbar
        title={t("metrics.topic_metrics")}
        timeDuration={timeDuration}
        onSetTimeDuration={onTimeDuration}
        isDisabled={noTopics || metricsDataUnavailable}
        isRefreshing={isRefreshing}
        selectedTopic={selectedTopic}
        onSetSelectedTopic={onSelectedTopic}
        onRefresh={onRefresh}
        topicList={topics}
      />
      {(() => {
        switch (true) {
          case isLoading && selectedTopic === undefined:
            return (
              <CardBody>
                <Bullseye>
                  <Spinner isSVG />
                </Bullseye>
              </CardBody>
            );

          case isLoading:
            return (
              <>
                <CardTitle component="h3">
                  {t("metrics.total_bytes")}{" "}
                  <ChartPopover
                    title={t("metrics.total_bytes")}
                    description={t("metrics.topic_metrics_help_text")}
                  />
                </CardTitle>
                <CardBody>
                  <Bullseye>
                    <Spinner isSVG />
                  </Bullseye>
                </CardBody>
                <Divider />

                <CardTitle component="h3">
                  {t("metrics.topic_partition_size")}
                </CardTitle>
                <CardBody>
                  <Bullseye>
                    <Spinner isSVG />
                  </Bullseye>
                </CardBody>
              </>
            );

          case metricsDataUnavailable:
            return (
              <CardBody>
                <ChartEmptyState
                  title={t("metrics.empty_state_no_data_title")}
                  body={t("metrics.empty_state_no_data_body")}
                  noData
                />
              </CardBody>
            );

          case noTopics:
            return (
              <CardBody>
                <ChartEmptyState
                  title={t("metrics.empty_state_no_topics_title")}
                  body={t("metrics.empty_state_no_topics_body")}
                  noTopics
                  onCreateTopic={onCreateTopic}
                />
              </CardBody>
            );

          case selectedTopic !== undefined:
            return (
              <>
                <CardTitle component="h3">
                  {t("metrics.total_bytes")}{" "}
                  <ChartPopover
                    title={t("metrics.total_bytes")}
                    description={t("metrics.topic_metrics_help_text")}
                  />
                </CardTitle>
                <CardBody>
                  <TotalBytesChart
                    incomingTopicsData={incomingTopicsData}
                    outgoingTopicsData={outgoingTopicsData}
                    selectedTopic={selectedTopic}
                    timeDuration={timeDuration}
                  />
                </CardBody>
                <Divider />

                <CardTitle component="h3">
                  {t("metrics.topic_partition_size")}
                </CardTitle>
                <CardBody>
                  <LogSizePerPartitionChart
                    partitions={partitions}
                    timeDuration={timeDuration}
                  />
                </CardBody>
              </>
            );

          default:
            return (
              <>
                <CardTitle component="h3">
                  {t("metrics.total_bytes")}{" "}
                  <ChartPopover
                    title={t("metrics.total_bytes")}
                    description={t("metrics.topic_metrics_help_text")}
                  />
                </CardTitle>
                <CardBody>
                  <TotalBytesChart
                    incomingTopicsData={incomingTopicsData}
                    outgoingTopicsData={outgoingTopicsData}
                    selectedTopic={selectedTopic}
                    timeDuration={timeDuration}
                  />
                </CardBody>
                <Divider />
                <CardTitle component="h3">
                  {t("metrics.topic_partition_size")}
                </CardTitle>
                <CardBody>
                  <ChartEmptyState
                    title={t("metrics.empty_state_no_filter_title")}
                    body={t("metrics.empty_state_no_filter_body")}
                    noFilter
                  />
                </CardBody>
              </>
            );
        }
      })()}
    </Card>
  );
};
