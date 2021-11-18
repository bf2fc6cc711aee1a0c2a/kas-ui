import { useSelector } from '@xstate/react';
import { useCallback, useContext, useMemo } from 'react';
import { DurationOptions } from './components/FilterByTime';
import { DiskSpaceMetricsModel } from './machines';
import { MetricsContext } from './MetricsProvider';

export function useDiskSpace() {
  const { diskSpaceMetricsMachineService: service } =
    useContext(MetricsContext);

  const selector = useCallback(
    (state: typeof service.state) => ({
      ...state.context,
      isRefreshing: state.hasTag('refreshing'),
      isLoading: state.hasTag('loading'),
      isFailed: state.hasTag('failed'),
      isDataUnavailable: state.hasTag('no-data'),
    }),
    []
  );
  const {
    metrics,
    timeDuration,
    isLoading,
    isRefreshing,
    isDataUnavailable,
    isFailed,
  } = useSelector(service, selector);

  const onDurationChange = useCallback(
    (duration: DurationOptions) =>
      service.send(DiskSpaceMetricsModel.events.selectDuration(duration)),
    [service]
  );

  const onRefresh = useCallback(
    () => service.send(DiskSpaceMetricsModel.events.refresh()),
    [service]
  );

  return {
    metrics,
    isLoading,
    isRefreshing,
    isFailed,
    isDataUnavailable,
    timeDuration,
    onDurationChange,
    onRefresh,
  };
}
