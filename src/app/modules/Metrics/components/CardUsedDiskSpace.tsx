import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { TotalBytesMetrics } from '../MetricsApi';
import { ChartLoading } from './ChartLoading';
import { ChartPopover } from './ChartPopover';
import { ChartUsedDiskSpace } from './ChartUsedDiskSpace';
import { EmptyStateMetricsUnavailable } from './EmptyStateMetricsUnavailable';
import { DurationOptions } from './FilterByTime';
import { ToolbarUsedDiskSpace } from './ToolbarUsedDiskSpace';

type CardUsedDiskSpaceProps = {
  metrics: TotalBytesMetrics;
  timeDuration: DurationOptions;
  metricsDataUnavailable: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onTimeDuration: (duration: DurationOptions) => void;
};

export const CardUsedDiskSpace: FunctionComponent<CardUsedDiskSpaceProps> = ({
  metrics,
  timeDuration,
  metricsDataUnavailable,
  isLoading,
  isRefreshing,
  onRefresh,
  onTimeDuration,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <ToolbarUsedDiskSpace
        title={t('metrics.kafka_instance_metrics')}
        timeDuration={timeDuration}
        onSetTimeDuration={onTimeDuration}
        isDisabled={metricsDataUnavailable}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
      {(() => {
        switch (true) {
          case isLoading:
            return (
              <>
                <UsedDiskSpaceTitle />
                <ChartLoading />
              </>
            );

          case metricsDataUnavailable:
            return (
              <CardBody>
                <EmptyStateMetricsUnavailable />
              </CardBody>
            );

          default:
            return (
              <>
                <UsedDiskSpaceTitle />
                <CardBody>
                  <ChartUsedDiskSpace
                    metrics={metrics}
                    timeDuration={timeDuration}
                  />
                </CardBody>
              </>
            );
        }
      })()}
    </Card>
  );
};

const UsedDiskSpaceTitle: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <CardTitle component='h3'>
      {t('metrics.used_disk_space')}{' '}
      <ChartPopover
        title={t('metrics.used_disk_space')}
        description={t('metrics.used_disk_space_help_text')}
      />
    </CardTitle>
  );
};
