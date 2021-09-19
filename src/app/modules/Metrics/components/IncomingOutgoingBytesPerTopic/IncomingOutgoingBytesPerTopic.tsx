import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import { isServiceApiError } from '@app/utils';
import { AlertVariant, Divider } from '@patternfly/react-core';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import {
  getLargestByteSize,
  convertToSpecifiedByte,
} from '@app/modules/Metrics/utils';
import {
  Bullseye,
  Card,
  CardTitle,
  CardBody,
  Spinner,
} from '@patternfly/react-core';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  ChartEmptyState,
  ChartPopover,
  ChartToolbar,
  LogSizePerPartitionChart,
} from '@app/modules/Metrics/components';

type Topic = {
  name: string;
  rawData: Map<number, number[]>;
  sortedData: TopicDataArray;
};

type TopicDataArray = { timestamp: number; bytes: number[] }[];

type ChartData = {
  color: string;
  line: TopicChartData[];
};

type TopicChartData = {
  name: string;
  x: string;
  y: number;
};

type LegendData = {
  name: string;
  symbol: any;
};

type KafkaInstanceProps = {
  kafkaID: string;
  metricsDataUnavailable: boolean;
  setMetricsDataUnavailable: (value: boolean) => void;
  onCreateTopic: () => void;
};

export const IncomingOutgoingBytesPerTopic: React.FC<KafkaInstanceProps> = ({
  kafkaID,
  metricsDataUnavailable,
  setMetricsDataUnavailable,
  onCreateTopic,
}: KafkaInstanceProps) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { addAlert } = useAlert() || {};
  const containerRef = useRef();
  const [width, setWidth] = useState();
  const [timeDuration, setTimeDuration] = useState(6);
  const [timeInterval, setTimeInterval] = useState(60);
  const [selectedTopic, setSelectedTopic] = useState<boolean | string>(false);
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);

  const handleResize = () =>
    containerRef.current && setWidth(containerRef.current.clientWidth);
  const itemsPerRow = width && width > 650 ? 6 : 3;

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const [chartData, setChartData] = useState<ChartData[]>();
  const [legend, setLegend] = useState<LegendData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const [noTopics, setNoTopics] = useState<boolean>();
  const [chartDataLoading, setChartDataLoading] = useState(true);
  const [topicList, setTopicList] = useState<string[]>([]);

  const fetchBytesData = async () => {
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
          [
            'kafka_server_brokertopicmetrics_bytes_in_total',
            'kafka_server_brokertopicmetrics_bytes_out_total',
          ]
        );

        const incomingTopics = {
          name: 'Total incoming bytes',
          rawData: new Map<number, number[]>(),
        } as Topic;

        const outgoingTopics = {
          name: 'Total outgoing bytes',
          rawData: new Map<number, number[]>(),
        } as Topic;

        if (data.data.items) {
          setMetricsDataUnavailable(false);

          data.data.items?.forEach((item, index) => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }

            if (
              labels['topic'] !== '__strimzi_canary' &&
              labels['topic'] !== '__consumer_offsets'
            ) {
              topicList &&
                labels['topic'] &&
                topicList.indexOf(labels['topic']) === -1 &&
                setTopicList([...topicList, labels['topic']]);
            }

            const isSelectedItem = isFilterApplied
              ? labels['topic'] !== '__strimzi_canary' &&
                labels['topic'] !== '__consumer_offsets' &&
                selectedTopic === labels['topic']
              : labels['topic'] !== '__strimzi_canary' &&
                labels['topic'] !== '__consumer_offsets';

            if (isSelectedItem) {
              if (
                labels['__name__'] ===
                'kafka_server_brokertopicmetrics_bytes_in_total'
              ) {
                item.values?.forEach((value, indexJ) => {
                  if (value.timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  if (incomingTopics.rawData.has(value.timestamp)) {
                    incomingTopics.rawData
                      .get(value.timestamp)
                      ?.push(value.value);
                  } else {
                    incomingTopics.rawData.set(value.timestamp, [
                      value.value,
                    ] as number[]);
                  }
                });
              }
              if (
                labels['__name__'] ===
                'kafka_server_brokertopicmetrics_bytes_out_total'
              ) {
                item.values?.forEach((value, indexJ) => {
                  if (value.timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  if (outgoingTopics.rawData.has(value.timestamp)) {
                    outgoingTopics.rawData
                      .get(value.timestamp)
                      ?.push(value.value);
                  } else {
                    outgoingTopics.rawData.set(value.timestamp, [
                      value.value,
                    ] as number[]);
                  }
                });
              }
            }
          });

          if (
            incomingTopics.rawData.size < 1 &&
            outgoingTopics.rawData.size < 1
          ) {
            setNoTopics(true);
            setChartDataLoading(false);
          } else {
            const incomingDataArr = [] as TopicDataArray;
            incomingTopics.rawData.forEach((value, key) =>
              incomingDataArr.push({ timestamp: key, bytes: value })
            );
            incomingTopics.sortedData = incomingDataArr.sort(
              (a, b) => a.timestamp - b.timestamp
            );
            const outgoingDataArr = [] as TopicDataArray;
            outgoingTopics.rawData.forEach((value, key) =>
              outgoingDataArr.push({ timestamp: key, bytes: value })
            );
            outgoingTopics.sortedData = outgoingDataArr.sort(
              (a, b) => a.timestamp - b.timestamp
            );
            getChartData(incomingTopics, outgoingTopics);
          }
        } else {
          setMetricsDataUnavailable(true);
          setChartDataLoading(false);
        }
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert &&
          addAlert({
            variant: AlertVariant.danger,
            title: t('common.something_went_wrong'),
            description: reason,
          });
      }
    }
  };

  useEffect(() => {
    fetchBytesData();
  }, [timeDuration, timeInterval]);

  // useTimeout(() => fetchBytesData(), 1000 * 60 * 5);

  const getChartData = (
    incomingTopicArray: Topic,
    outgoingTopicArray: Topic
  ) => {
    const legendData: Array<LegendData> = [];
    const chartData: Array<ChartData> = [];
    const largestByteSize = getLargestByteSize(
      incomingTopicArray,
      outgoingTopicArray
    );

    // Aggregate of Incoming Bytes per Topic
    if (incomingTopicArray) {
      const line: Array<TopicChartData> = [];
      const color = chart_color_blue_300.value;

      const getCurrentLengthOfData = () => {
        const timestampDiff =
          incomingTopicArray.sortedData[
            incomingTopicArray.sortedData.length - 1
          ].timestamp - incomingTopicArray.sortedData[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360 && timeDuration >= 6) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newTimestamp =
            incomingTopicArray.sortedData[0].timestamp -
            (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newTimestamp);
          const time = date.getHours() + ':' + date.getMinutes();
          line.push({ name: incomingTopicArray.name, x: time, y: 0 });
        }
      }

      incomingTopicArray.sortedData.map((value) => {
        const date = new Date(value.timestamp);
        const time = date.getHours() + ':' + date.getMinutes();

        const aggregateBytes = value.bytes.reduce(function (a, b) {
          return a + b;
        }, 0);
        const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
        line.push({ name: incomingTopicArray.name, x: time, y: bytes });
      });

      chartData.push({ color, line });

      legendData.push({
        name: incomingTopicArray.name,
        symbol: {
          fill: chart_color_blue_300.value,
        },
      });
    }

    // Aggregate of Outgoing Bytes per Topic
    if (outgoingTopicArray) {
      const line: Array<TopicChartData> = [];
      const color = chart_color_orange_300.value;

      const getCurrentLengthOfData = () => {
        const timestampDiff =
          outgoingTopicArray.sortedData[
            outgoingTopicArray.sortedData.length - 1
          ].timestamp - outgoingTopicArray.sortedData[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360 && timeDuration >= 6) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newTimestamp =
            outgoingTopicArray.sortedData[0].timestamp -
            (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newTimestamp);
          const time = date.getHours() + ':' + date.getMinutes();
          line.push({ name: outgoingTopicArray.name, x: time, y: 0 });
        }
      }

      outgoingTopicArray.sortedData.map((value) => {
        const date = new Date(value.timestamp);
        const time = date.getHours() + ':' + date.getMinutes();

        const aggregateBytes = value.bytes.reduce(function (a, b) {
          return a + b;
        }, 0);
        const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
        line.push({ name: outgoingTopicArray.name, x: time, y: bytes });
      });
      chartData.push({ color, line });
      legendData.push({
        name: outgoingTopicArray.name,
        symbol: {
          fill: chart_color_orange_300.value,
        },
      });
    }
    setLegend(legendData);
    setChartData(chartData);
    setLargestByteSize(largestByteSize);
    setChartDataLoading(false);
  };

  const onRefreshTopicToolbar = () => {
    fetchBytesData();
  };

  return (
    <Card>
      <ChartToolbar
        showTopicFilter={true}
        title={t('metrics.topic_metrics')}
        setTimeDuration={setTimeDuration}
        setTimeInterval={setTimeInterval}
        showTopicToolbar={!noTopics && !metricsDataUnavailable}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        onRefreshTopicToolbar={onRefreshTopicToolbar}
        topicList={topicList}
        setIsFilterApplied={setIsFilterApplied}
      />
      <CardTitle component='h2'>
        {t('metrics.total_bytes')}{' '}
        <ChartPopover
          title={t('metrics.total_bytes')}
          description={t('metrics.topic_metrics_help_text')}
        />
      </CardTitle>
      <CardBody>
        <div ref={containerRef}>
          <div>
            {!chartDataLoading ? (
              !metricsDataUnavailable ? (
                !noTopics ? (
                  chartData &&
                  legend &&
                  largestByteSize && (
                    <>
                      <Chart
                        ariaDesc={t('metrics.total_bytes')}
                        ariaTitle='Total Bytes'
                        containerComponent={
                          <ChartVoronoiContainer
                            labels={({ datum }) => `${datum.name}: ${datum.y}`}
                            constrainToVisibleArea
                          />
                        }
                        legendAllowWrap={true}
                        legendPosition='bottom-left'
                        legendComponent={
                          <ChartLegend
                            data={legend}
                            itemsPerRow={itemsPerRow}
                          />
                        }
                        height={300}
                        padding={{
                          bottom: 110,
                          left: 90,
                          right: 30,
                          top: 25,
                        }}
                        themeColor={ChartThemeColor.multiUnordered}
                        width={width}
                      >
                        <ChartAxis label={'Time'} tickCount={6} />
                        <ChartAxis
                          dependentAxis
                          tickFormat={(t) =>
                            `${Math.round(t)} ${largestByteSize}`
                          }
                          tickCount={4}
                          minDomain={{ y: 0 }}
                        />
                        <ChartGroup>
                          {chartData.map((value, index) => (
                            <ChartLine
                              key={`chart-line-${index}`}
                              data={value.line}
                              style={{
                                data: {
                                  stroke: value.color,
                                },
                              }}
                            />
                          ))}
                        </ChartGroup>
                      </Chart>

                      <Divider />
                      {selectedTopic ? (
                        <LogSizePerPartitionChart
                          kafkaID={kafkaID}
                          timeDuration={timeDuration}
                          timeInterval={timeInterval}
                        />
                      ) : (
                        <Card>
                          <CardTitle component='h2'>
                            {t('metrics.topic_partition_size')}
                          </CardTitle>
                          <CardBody>
                            <ChartEmptyState
                              title={t('metrics.empty_state_no_filter_title')}
                              body={t('metrics.empty_state_no_filter_body')}
                              noFilter
                            />{' '}
                          </CardBody>
                        </Card>
                      )}
                    </>
                  )
                ) : (
                  <ChartEmptyState
                    title={t('metrics.empty_state_no_topics_title')}
                    body={t('metrics.empty_state_no_topics_body')}
                    noTopics
                    onCreateTopic={onCreateTopic}
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
        </div>
      </CardBody>
    </Card>
  );
};
