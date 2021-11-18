import { useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { useInterpret } from '@xstate/react';
import React, { createContext, FunctionComponent } from 'react';
import { InterpreterFrom } from 'xstate';
import {
  DiskSpaceMetricsMachine,
  TopicsMetricsMachineType,
  TopicsMetricsMachine,
  TopicsMetricsModel,
  DiskSpaceMachineType,
  DiskSpaceMetricsModel,
} from './machines';
import { fetchDiskSpaceMetrics, fetchTopicsMetrics } from './MetricsApi';

type MetricsContextProps = {
  kafkaId: string;
  topicsMetricsMachineService: InterpreterFrom<TopicsMetricsMachineType>;
  diskSpaceMetricsMachineService: InterpreterFrom<DiskSpaceMachineType>;
};
export const MetricsContext = createContext<MetricsContextProps>(null!);

type MetricsProviderProps = {
  kafkaId: string;
};

export const MetricsProvider: FunctionComponent<MetricsProviderProps> = ({
  kafkaId,
  children,
}) => {
  const topicsMetricsMachineService = useTopicsMetricsMachineService(kafkaId);
  const diskSpaceMetricsMachineService =
    useDiskSpaceMetricsMachineService(kafkaId);
  return (
    <MetricsContext.Provider
      value={{
        kafkaId,
        diskSpaceMetricsMachineService,
        topicsMetricsMachineService,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

function useTopicsMetricsMachineService(kafkaId: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  return useInterpret(
    TopicsMetricsMachine.withConfig({
      services: {
        api: (context) => {
          return (callback) => {
            fetchTopicsMetrics({
              kafkaId: kafkaId,
              selectedTopic: context.selectedTopic,
              timeDuration: context.timeDuration,
              timeInterval: 60, // TODO: fix this
              accessToken: auth.kas.getToken(),
              basePath: basePath,
            })
              .then((results) =>
                callback(TopicsMetricsModel.events.fetchSuccess(results))
              )
              .catch((e) => {
                console.error('Failed fetching data', e);
                callback(TopicsMetricsModel.events.fetchFail());
              });
          };
        },
      },
    }),
    {
      devTools: true,
    }
  );
}
function useDiskSpaceMetricsMachineService(kafkaId: string) {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  return useInterpret(
    DiskSpaceMetricsMachine.withConfig({
      services: {
        api: (context) => {
          return (callback) => {
            fetchDiskSpaceMetrics({
              kafkaId: kafkaId,
              timeDuration: context.timeDuration,
              timeInterval: 60, // TODO: fix this
              accessToken: auth.kas.getToken(),
              basePath: basePath,
            })
              .then((results) =>
                callback(
                  DiskSpaceMetricsModel.events.fetchSuccess({
                    metrics: results,
                  })
                )
              )
              .catch((e) => {
                console.error('Failed fetching data', e);
                callback(DiskSpaceMetricsModel.events.fetchFail());
              });
          };
        },
      },
    }),
    {
      devTools: true,
    }
  );
}
