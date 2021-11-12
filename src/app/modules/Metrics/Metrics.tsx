import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import {
  UsedDiskSpaceChart,
  IncomingOutgoingBytesPerTopic,
} from '@app/modules/Metrics/components';
import { ChartEmptyState } from './components/ChartEmptyState';
import { useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { fetchBytesData, TopicDataArray } from './Metrics.api';

export interface MetricsProps {
  kafkaId: string;
  onCreateTopic: () => void;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);

  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined
  );
  const [chartDataLoading, setChartDataLoading] = useState(true);
  const [topicList, setTopicList] = useState<string[]>([]);
  const [timeDuration, setTimeDuration] = useState(6);
  const [timeInterval, setTimeInterval] = useState(60);
  const [{ incomingTopicsData, outgoingTopicsData }, setTopicsData] = useState<{
    incomingTopicsData: TopicDataArray;
    outgoingTopicsData: TopicDataArray;
  }>({ incomingTopicsData: [], outgoingTopicsData: [] });

  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};

  async function fetchData() {
    setChartDataLoading(true);
    const { incomingTopics, outgoingTopics, topicList } = await fetchBytesData({
      kafkaID: kafkaId,
      selectedTopic,
      timeDuration,
      timeInterval,
      accessToken: auth?.kas.getToken(),
      basePath,
    });

    setTopicList(topicList);
    setTopicsData({
      incomingTopicsData: incomingTopics,
      outgoingTopicsData: outgoingTopics,
    });
    setChartDataLoading(false);
  }

  useEffect(() => {
    fetchData();
    // TODO: check for the returned data
    // addAlert &&
    //   addAlert({
    //     variant: AlertVariant.danger,
    //     title: t("common.something_went_wrong"),
    //     description: reason,
    //   });
  }, [timeDuration, timeInterval]);

  return (
    <PageSection>
      {!metricsDataUnavailable ? (
        <Grid hasGutter>
          <GridItem>
            <UsedDiskSpaceChart
              kafkaID={kafkaId}
              metricsDataUnavailable={metricsDataUnavailable}
              setMetricsDataUnavailable={setMetricsDataUnavailable}
            />
          </GridItem>
          <GridItem>
            <IncomingOutgoingBytesPerTopic
              metricsDataUnavailable={metricsDataUnavailable}
              kafkaID={kafkaId}
              onCreateTopic={onCreateTopic}
              topicList={topicList}
              incomingTopicsData={incomingTopicsData}
              outgoingTopicsData={outgoingTopicsData}
              timeDuration={timeDuration}
              timeInterval={timeInterval}
              isLoading={chartDataLoading}
              selectedTopic={selectedTopic}
              onRefresh={fetchData}
              onSelectedTopic={setSelectedTopic}
              onTimeDuration={setTimeDuration}
              onTimeInterval={setTimeInterval}
            />
          </GridItem>
        </Grid>
      ) : (
        <ChartEmptyState
          title={t('metrics.empty_state_no_data_title')}
          body={t('metrics.empty_state_no_data_body')}
          noData
        />
      )}
    </PageSection>
  );
};
