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
} from "@app/modules/Metrics/Metrics.api";
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Spinner,
} from "@patternfly/react-core";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type IncomingOutgoingBytesPerTopicProps = {
  topics: string[];
  incomingTopicsData: TotalBytesMetrics;
  outgoingTopicsData: TotalBytesMetrics;
  partitions: PartitionBytesMetric;
  timeDuration: number;
  metricsDataUnavailable: boolean;
  isLoading: boolean;
  selectedTopic: string | undefined;
  onCreateTopic: () => void;
  onRefresh: () => void;
  onSelectedTopic: (topic: string | undefined) => void;
  onTimeDuration: (duration: number) => void;
};

export const IncomingOutgoingBytesPerTopic: React.FC<IncomingOutgoingBytesPerTopicProps> =
  ({
    topics,
    incomingTopicsData,
    outgoingTopicsData,
    selectedTopic,
    timeDuration,
    partitions,
    metricsDataUnavailable,
    isLoading,
    onCreateTopic,
    onRefresh,
    onSelectedTopic,
    onTimeDuration,
  }) => {
    const { t } = useTranslation();
    // const { addAlert } = useAlert() || {};
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number>();

    const handleResize = () =>
      containerRef.current && setWidth(containerRef.current.clientWidth);
    const itemsPerRow = width && width > 650 ? 6 : 3;

    useEffect(() => {
      handleResize();
      window.addEventListener("resize", handleResize);
    }, [width]);

    const noTopics = topics.length === 0;

    return (
      <Card>
        <TopicMetricsToolbar
          title={t("metrics.topic_metrics")}
          onSetTimeDuration={onTimeDuration}
          isDisabled={noTopics || metricsDataUnavailable}
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
                  <CardBody>
                    <CardTitle component="h3">
                      {t("metrics.total_bytes")}{" "}
                      <ChartPopover
                        title={t("metrics.total_bytes")}
                        description={t("metrics.topic_metrics_help_text")}
                      />
                    </CardTitle>
                    <Bullseye>
                      <Spinner isSVG />
                    </Bullseye>
                  </CardBody>
                  <Divider />

                  <CardBody>
                    <CardTitle component="h3">
                      {t("metrics.topic_partition_size")}
                    </CardTitle>
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
                  <CardBody>
                    <CardTitle component="h3">
                      {t("metrics.total_bytes")}{" "}
                      <ChartPopover
                        title={t("metrics.total_bytes")}
                        description={t("metrics.topic_metrics_help_text")}
                      />
                    </CardTitle>
                    <div ref={containerRef}>
                      <TotalBytesChart
                        incomingTopicsData={incomingTopicsData}
                        outgoingTopicsData={outgoingTopicsData}
                        selectedTopic={selectedTopic}
                        timeDuration={timeDuration}
                        itemsPerRow={itemsPerRow}
                        width={width || 0}
                      />
                    </div>
                  </CardBody>

                  <CardBody>
                    <CardTitle component="h3">
                      {t("metrics.topic_partition_size")}
                    </CardTitle>
                    <LogSizePerPartitionChart
                      partitions={partitions}
                      timeDuration={timeDuration}
                      itemsPerRow={itemsPerRow}
                      width={width || 0}
                    />
                  </CardBody>
                </>
              );

            default:
              return (
                <>
                  <CardBody>
                    <CardTitle component="h3">
                      {t("metrics.total_bytes")}{" "}
                      <ChartPopover
                        title={t("metrics.total_bytes")}
                        description={t("metrics.topic_metrics_help_text")}
                      />
                    </CardTitle>
                    <div ref={containerRef}>
                      <TotalBytesChart
                        incomingTopicsData={incomingTopicsData}
                        outgoingTopicsData={outgoingTopicsData}
                        selectedTopic={selectedTopic}
                        timeDuration={timeDuration}
                        itemsPerRow={itemsPerRow}
                        width={width || 0}
                      />
                    </div>
                    <Divider />

                    <Card>
                      <CardBody>
                        <CardTitle component="h3">
                          {t("metrics.topic_partition_size")}
                        </CardTitle>
                        <ChartEmptyState
                          title={t("metrics.empty_state_no_filter_title")}
                          body={t("metrics.empty_state_no_filter_body")}
                          noFilter
                        />
                      </CardBody>
                    </Card>
                  </CardBody>
                </>
              );
          }
        })()}
      </Card>
    );
  };
