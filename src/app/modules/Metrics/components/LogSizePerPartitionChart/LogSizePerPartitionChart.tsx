import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@rhoas/app-services-ui-shared';
import { isServiceApiError } from '@app/utils';
import {
  AlertVariant,
  Bullseye,
  Card,
  CardTitle,
  CardBody,
  Spinner,
} from '@patternfly/react-core';
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
import byteSize from 'byte-size';
import { ChartEmptyState, ChartPopover } from '@app/modules/Metrics/components';
import {
  getLargestByteSize,
  convertToSpecifiedByte,
} from '@app/modules/Metrics/utils';

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
  timeInterval: number;
  timeDuration: number;
};

export const LogSizePerPartitionChart: React.FC<KafkaInstanceProps> = ({
  kafkaID,
  timeDuration,
  timeInterval,
}: KafkaInstanceProps) => {
  const containerRef = useRef();
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert();
  const [width, setWidth] = useState<number>();
  const [legend, setLegend] = useState();
  const [chartData, setChartData] = useState<ChartData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(true);
  const [noTopics, setNoTopics] = useState<boolean>();

  const colors = [chart_color_green_300.value, chart_color_blue_300.value];

  const handleResize = () =>
    containerRef.current && setWidth(containerRef.current.clientWidth);
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
        const data = await apisService.getMetricsByRangeQuery(
          kafkaID,
          timeDuration * 60,
          timeInterval * 60,
          ['kafka_log_log_size']
        );

        const partitionArray: Partition[] = [];

        if (data.data.items) {
          setMetricsDataUnavailable(false);
          data.data.items?.forEach((item, i) => {
            const topicName = item?.metric?.topic;
            const labels = item.metric;
            if (item.metric === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }

            const topic = {
              name: topicName,
              data: [],
            } as Partition;

            const isTopicInArray = partitionArray.some(
              (topic) => topic.name === topicName
            );

            if (labels['__name__'] === 'kafka_topic:kafka_log_log_size:sum') {
              item.values?.forEach((value) => {
                if (value.timestamp == undefined) {
                  throw new Error('timestamp cannot be undefined');
                }

                if (isTopicInArray) {
                  partitionArray.forEach((topic: Partition) => {
                    if (topic.name === topicName) {
                      topic.data.forEach(
                        (datum) => (datum.bytes = datum.bytes + value.value)
                      );
                    }
                  });
                } else {
                  topic.data.push({
                    name: topicName || '',
                    timestamp: value.timestamp,
                    bytes: value.value,
                  });
                }
              });
            }

            if (!isTopicInArray) {
              partitionArray.push(topic);
            }
          });
          // Check if atleast one topic exists that isn't Strimzi Canary or Consumer Offsets - Keep this here for testing purposes
          const filteredTopics = partitionArray.filter(
            (topic) =>
              topic.name !== '__strimzi_canary' &&
              topic.name !== '__consumer_offsets'
          );

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
        addAlert({
          variant: AlertVariant.danger,
          title: t('common.something_went_wrong'),
          description: reason,
        });
      }
    }
  };

  useEffect(() => {
    fetchLogSizePerPartition();
    handleResize();
  }, [timeInterval, timeDuration]);

  // useTimeout(() => fetchLogSizePerPartition(), 1000 * 60 * 5);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const getChartData = (partitionArray) => {
    const legendData: Array<LegendData> = [];
    const chartData: Array<ChartData> = [];
    const largestByteSize = getLargestByteSize(partitionArray, undefined);
    partitionArray.map((partition, index) => {
      const color = colors[index];
      legendData.push({
        name: partition.name,
      });
      const area: Array<PartitionChartData> = [];

      const getCurrentLengthOfData = () => {
        const timestampDiff =
          partition.data[partition.data.length - 1].timestamp -
          partition.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360 && timeDuration >= 6) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newtimestamp =
            partition.data[0].timestamp -
            (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newtimestamp);
          const time = date.getHours() + ':' + date.getMinutes();
          area.push({ name: partition.name, x: time, y: 0 });
        }
      }

      partition.data.map((value) => {
        const date = new Date(value.timestamp);
        const time = date.getHours() + ':' + date.getMinutes();
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
      <CardTitle component='h2'>
        {t('metrics.log_size_per_partition')}{' '}
        <ChartPopover
          title={t('metrics.log_size_per_partition')}
          description={t('metrics.log_size_per_partition_help_text')}
        />
      </CardTitle>
      <CardBody>
        <div ref={containerRef}>
          {!chartDataLoading ? (
            !metricsDataUnavailable ? (
              !noTopics ? (
                chartData &&
                legend &&
                byteSize && (
                  <Chart
                    ariaTitle={t('metrics.log_size_per_partition')}
                    containerComponent={
                      <ChartVoronoiContainer
                        labels={({ datum }) => `${datum.name}: ${datum.y}`}
                        constrainToVisibleArea
                      />
                    }
                    legendPosition='bottom-left'
                    legendComponent={
                      <ChartLegend data={legend} itemsPerRow={itemsPerRow} />
                    }
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
                    <ChartAxis
                      dependentAxis
                      tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
                    />
                    <ChartGroup>
                      {chartData.map((value, index) => (
                        <ChartArea
                          key={`chart-area-${index}`}
                          data={value.area}
                          interpolation='monotoneX'
                        />
                      ))}
                    </ChartGroup>
                  </Chart>
                )
              ) : (
                <ChartEmptyState
                  title={t('metrics.empty_state_no_topics_title')}
                  body={t('metrics.empty_state_no_topics_body')}
                  noTopics
                />
              )
            ) : (
              <ChartEmptyState
                title={t('metrics.empty_state_no_data_title')}
                body={t('metrics.empty_state_no_data_body')}
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
