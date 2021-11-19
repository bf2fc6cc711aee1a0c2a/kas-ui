import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Spinner,
} from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartPopover,
  EmptyStateMetricsUnavailable,
  ChartUsedDiskSpace,
  ToolbarUsedDiskSpace,
} from '.';
import { TotalBytesMetrics } from '../MetricsApi';
import { DurationOptions } from './FilterByTime';

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
                <CardTitle component='h3'>
                  {t('metrics.used_disk_space')}{' '}
                  <ChartPopover
                    title={t('metrics.used_disk_space')}
                    description={t('metrics.used_disk_space_help_text')}
                  />
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
                <EmptyStateMetricsUnavailable />
              </CardBody>
            );

          default:
            return (
              <>
                <CardTitle component='h3'>
                  {t('metrics.used_disk_space')}{' '}
                  <ChartPopover
                    title={t('metrics.used_disk_space')}
                    description={t('metrics.used_disk_space_help_text')}
                  />
                </CardTitle>
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
