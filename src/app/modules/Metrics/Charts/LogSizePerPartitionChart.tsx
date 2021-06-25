import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import { isServiceApiError } from '@app/utils';
import { AlertVariant, Bullseye, Card, CardTitle, CardBody, Spinner } from '@patternfly/react-core';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import { format } from 'date-fns';
import byteSize from 'byte-size';
import { ChartEmptyState } from './ChartEmptyState';
import { useTimeout } from '@app/hooks/useTimeout';
import { getLargestByteSize, convertToSpecifiedByte } from './utils';

export type Partition = {
  name: string;
  data: {
    timestamp: number;
    bytes: number;
    name: string;
  }[];
};

export type ChartData = {
  color: string;
  area: PartitionChartData[];
};

export type PartitionChartData = {
  name: string;
  x: string;
  y: number;
};

export type LegendData = {
  name: string;
};

export type KafkaInstanceProps = {
  kafkaID: string;
};

export const LogSizePerPartitionChart: React.FC<KafkaInstanceProps> = ({ kafkaID }: KafkaInstanceProps) => {
  const containerRef = useRef();
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState();
  const [chartData, setChartData] = useState<ChartData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(true);
  const [noTopics, setNoTopics] = useState();

  const colors = [chart_color_green_300.value, chart_color_blue_300.value];

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);
  const itemsPerRow = width && width > 650 ? 6 : 3;

  // Functions
  const fetchLogSizePerPartition = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        if (!kafkaID) {
          return;
        }
        const data = await apisService.getMetricsByRangeQuery(kafkaID, 6 * 60, 5 * 60, ['kafka_log_log_size']);

        console.log('what is data log size per partition' + JSON.stringify(data));

        const partitionArray: Partition[] = [];

        if (data.data.items) {
          setMetricsDataUnavailable(false);
          data.data.items?.forEach((item, i) => {
            const topicName = item?.metric?.topic;

            const topic = {
              name: topicName,
              data: [],
            } as Partition;

            const isTopicInArray = partitionArray.some((topic) => topic.name === topicName);

            item.values?.forEach((value) => {
              if (value.Timestamp == undefined) {
                throw new Error('timestamp cannot be undefined');
              }

              if (isTopicInArray) {
                partitionArray.map((topic: Partition) => {
                  if (topic.name === topicName) {
                    topic.data.forEach((datum) => {
                      datum.bytes = datum.bytes + value.Value;
                    });
                  }
                });
              } else {
                topic.data.push({
                  name: topicName,
                  timestamp: value.Timestamp,
                  bytes: value.Value,
                });
              }
            });

            if (!isTopicInArray) {
              partitionArray.push(topic);
            }
          });
          // Check if atleast one topic exists that isn't Strimzi Canary or Consumer Offsets - Keep this here for testing purposes
          const filteredTopics = partitionArray.filter(
            (topic) => topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets'
          );
          console.log('what is filteredTopics for logsize' + filteredTopics);
          if (filteredTopics.length < 1) {
            setNoTopics(true);
          }
          getChartData(filteredTopics);
        } else {
          setMetricsDataUnavailable(true);
          setChartDataLoading(false);
        }
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
      }
    }
  };

  useEffect(() => {
    fetchLogSizePerPartition();
    handleResize();
  }, []);

  useTimeout(() => fetchLogSizePerPartition(), 1000 * 60 * 5);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const getChartData = (partitionArray) => {
    console.log('what is partitionArray' + partitionArray);

    const legendData: Array<LegendData> = [];
    const chartData: Array<ChartData> = [];
    const largestByteSize = getLargestByteSize(partitionArray);
    partitionArray.map((partition, index) => {
      const color = colors[index];
      legendData.push({
        name: partition.name,
      });
      const area: Array<PartitionChartData> = [];

      const getCurrentLengthOfData = () => {
        const timestampDiff = partition.data[partition.data.length - 1].timestamp - partition.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newTimestamp = partition.data[0].timestamp - (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          area.push({ name: partition.name, x: time, y: 0 });
        }
      }

      partition.data.map((value) => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const bytes = convertToSpecifiedByte(value.bytes, largestByteSize);
        area.push({ name: value.name, x: time, y: bytes });
      });
      chartData.push({ color, area });
    });
    setLegend(legendData);
    setChartData(chartData);
    setLargestByteSize(largestByteSize);
    setChartDataLoading(false);
  };

  return (
    <Card>
      <CardTitle component="h2">{t('metrics.log_size_per_partition')}</CardTitle>
      <CardBody>
        <div ref={containerRef}>
          {!chartDataLoading ? (
            !metricsDataUnavailable ? (
              !noTopics ? (
                chartData &&
                legend &&
                byteSize && (
                  <Chart
                    ariaDesc={t('metrics.log_size_per_partition')}
                    ariaTitle="Log Size"
                    containerComponent={
                      <ChartVoronoiContainer
                        labels={({ datum }) => `${datum.name}: ${datum.y}`}
                        constrainToVisibleArea
                      />
                    }
                    legendPosition="bottom-left"
                    legendComponent={<ChartLegend data={legend} itemsPerRow={itemsPerRow} />}
                    height={350}
                    padding={{
                      bottom: 110,
                      left: 90,
                      right: 30,
                      top: 25,
                    }}
                    themeColor={ChartThemeColor.multiUnordered}
                    width={width}
                    legendAllowWrap={true}
                  >
                    <ChartAxis label={'Time'} tickCount={6} />
                    <ChartAxis dependentAxis tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`} />
                    <ChartGroup>
                      {chartData.map((value, index) => (
                        <ChartArea key={`chart-area-${index}`} data={value.area} interpolation="monotoneX" />
                      ))}
                    </ChartGroup>
                  </Chart>
                )
              ) : (
                <ChartEmptyState
                  title="No topics yet"
                  body="Data will show when topics exist and are in use."
                  noTopics
                />
              )
            ) : (
              <ChartEmptyState
                title="No data"
                body="We’re creating your Kafka instance, so some details aren’t yet available."
                noData
              />
            )
          ) : (
            <Bullseye>
              <Spinner isSVG />
            </Bullseye>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
