import {
  ChartLogSizePerPartition,
  ChartPopover,
  ChartTotalBytes,
  EmptyStateNoTopicData,
  EmptyStateNoTopicSelected,
  ToolbarTopicsMetrics,
} from '@app/modules/Metrics/components';
import {
  PartitionBytesMetric,
  TotalBytesMetrics,
} from '@app/modules/Metrics/MetricsApi';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Spinner,
} from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartLoading } from './ChartLoading';
import { EmptyStateMetricsUnavailable } from './EmptyStateMetricsUnavailable';
import { EmptyStateNoTopics } from './EmptyStateNoTopics';
import { DurationOptions } from './FilterByTime';

type CardTopicsMetricsProps = {
  topics: string[];
  incomingTopicsData: TotalBytesMetrics;
  outgoingTopicsData: TotalBytesMetrics;
  partitions: PartitionBytesMetric;
  timeDuration: DurationOptions;
  backendUnavailable: boolean;
  metricsDataUnavailable: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  selectedTopic: string | undefined;
  onCreateTopic: () => void;
  onRefresh: () => void;
  onSelectedTopic: (topic: string | undefined) => void;
  onTimeDuration: (duration: DurationOptions) => void;
};

export const CardTopicsMetrics: FunctionComponent<CardTopicsMetricsProps> = ({
  topics,
  incomingTopicsData,
  outgoingTopicsData,
  selectedTopic,
  timeDuration,
  partitions,
  backendUnavailable,
  metricsDataUnavailable,
  isLoading,
  isRefreshing,
  onCreateTopic,
  onRefresh,
  onSelectedTopic,
  onTimeDuration,
}) => {
  const { t } = useTranslation();
  const noTopics = topics.length === 0;

  return (
    <Card>
      <ToolbarTopicsMetrics
        title={t('metrics.topic_metrics')}
        timeDuration={timeDuration}
        onSetTimeDuration={onTimeDuration}
        isDisabled={backendUnavailable || noTopics}
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
                <TotalBytesTitle />
                <ChartLoading />
                <Divider />

                <PartitionSizeTitle />
                <ChartLoading />
              </>
            );

          case backendUnavailable:
            return (
              <CardBody>
                <EmptyStateMetricsUnavailable />
              </CardBody>
            );

          case metricsDataUnavailable:
            return (
              <CardBody>
                <EmptyStateNoTopicData />
              </CardBody>
            );

          case noTopics:
            return (
              <CardBody>
                <EmptyStateNoTopics onCreateTopic={onCreateTopic} />
              </CardBody>
            );

          case selectedTopic !== undefined:
            return (
              <>
                <TotalBytesTitle />
                <CardBody>
                  <ChartTotalBytes
                    incomingTopicsData={incomingTopicsData}
                    outgoingTopicsData={outgoingTopicsData}
                    selectedTopic={selectedTopic}
                    timeDuration={timeDuration}
                  />
                </CardBody>
                <Divider />

                <PartitionSizeTitle />
                <CardBody>
                  <ChartLogSizePerPartition
                    partitions={partitions}
                    timeDuration={timeDuration}
                  />
                </CardBody>
              </>
            );

          default:
            return (
              <>
                <TotalBytesTitle />
                <CardBody>
                  <ChartTotalBytes
                    incomingTopicsData={incomingTopicsData}
                    outgoingTopicsData={outgoingTopicsData}
                    selectedTopic={selectedTopic}
                    timeDuration={timeDuration}
                  />
                </CardBody>
                <Divider />
                <PartitionSizeTitle />
                <CardBody>
                  <EmptyStateNoTopicSelected />
                </CardBody>
              </>
            );
        }
      })()}
    </Card>
  );
};

const TotalBytesTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <CardTitle component='h3'>
      {t('metrics.total_bytes')}{' '}
      <ChartPopover
        title={t('metrics.total_bytes')}
        description={t('metrics.topic_metrics_help_text')}
      />
    </CardTitle>
  );
};

const PartitionSizeTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <CardTitle component='h3'>{t('metrics.topic_partition_size')}</CardTitle>
  );
};
