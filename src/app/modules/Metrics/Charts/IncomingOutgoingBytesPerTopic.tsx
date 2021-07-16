import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Configuration, DefaultApi } from '@rhoas/kafka-management-sdk';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import { isServiceApiError } from '@app/utils';
import { AlertVariant } from '@patternfly/react-core';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import { format } from 'date-fns';
import { useTimeout } from '@app/hooks/useTimeout';
import { getLargestByteSize, convertToSpecifiedByte } from './utils';
import { Bullseye, Card, CardTitle, CardBody, Spinner } from '@patternfly/react-core';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartToolbar } from './ChartToolbar';

type Topic = {
  name: string;
  data: {
    timestamp: number;
    bytes: number[];
  }[];
};

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
};

export const IncomingOutgoingBytesPerTopic: React.FC<KafkaInstanceProps> = ({
  kafkaID,
  metricsDataUnavailable,
  setMetricsDataUnavailable,
}: KafkaInstanceProps) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert();
  const containerRef = useRef();
  const [width, setWidth] = useState();
  const [timeInterval, setTimeInterval] = useState(1);

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);
  const itemsPerRow = width && width > 650 ? 6 : 3;

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const [chartData, setChartData] = useState<ChartData[]>();
  const [legend, setLegend] = useState<LegendData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const [noTopics, setNoTopics] = useState<boolean>();
  const [chartDataLoading, setChartDataLoading] = useState(true);

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
        const data = await apisService.getMetricsByRangeQuery(kafkaID, timeInterval * 60, 5 * 60, [
          'kafka_server_brokertopicmetrics_bytes_in_total',
          'kafka_server_brokertopicmetrics_bytes_out_total',
        ]);
        console.log('data', data);
        const incomingTopics = {
          name: 'Total incoming byte rate',
          data: [],
        } as Topic;

        const outgoingTopics = {
          name: 'Total outgoing byte rate',
          data: [],
        } as Topic;

        if (data.data.items) {
          setMetricsDataUnavailable(false);

          let incomingCount = 0;
          let outgoingCount = 0;

          data.data.items?.forEach((item, index) => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }

            console.log('what is label here' + labels['topic']);

            if (labels['topic'] !== '__strimzi_canary' && labels['topic'] !== '__consumer_offsets') {
              if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total') {
                item.values?.forEach((value, indexJ) => {
                  if (value.timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  if (incomingCount > 0) {
                    const newArray = incomingTopics.data[indexJ].bytes.concat(value.value);
                    incomingTopics.data[indexJ].bytes = newArray;
                  } else {
                    incomingTopics.data.push({
                      timestamp: value.timestamp,
                      bytes: [value.value],
                    });
                  }
                });
                incomingCount++;
              }
              if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total') {
                item.values?.forEach((value, indexJ) => {
                  if (value.timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  if (outgoingCount > 0) {
                    const newArray = outgoingTopics.data[indexJ].bytes.concat(value.value);
                    outgoingTopics.data[indexJ].bytes = newArray;
                  } else {
                    outgoingTopics.data.push({
                      timestamp: value.timestamp,
                      bytes: [value.value],
                    });
                  }
                });
                outgoingCount++;
              }
            }
          });

          if (incomingTopics.data.length < 1 && outgoingTopics.data.length < 1) {
            setNoTopics(true);
            setChartDataLoading(false);
          } else {
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
        addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
      }
    }
  };

  useEffect(() => {
    fetchBytesData();
  }, [timeInterval]);

  useTimeout(() => fetchBytesData(), 1000 * 60 * 5);

  const getChartData = (incomingTopicArray, outgoingTopicArray) => {
    const legendData: Array<LegendData> = [];
    const chartData: Array<ChartData> = [];
    const largestByteSize = getLargestByteSize(incomingTopicArray, outgoingTopicArray);

    // Aggregate of Incoming Bytes per Topic
    if (incomingTopicArray) {
      const line: Array<TopicChartData> = [];
      const color = chart_color_blue_300.value;

      const getCurrentLengthOfData = () => {
        const timestampDiff =
          incomingTopicArray.data[incomingTopicArray.data.length - 1].timestamp - incomingTopicArray.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newTimestamp = incomingTopicArray.data[0].timestamp - (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          line.push({ name: incomingTopicArray.name, x: time, y: 0 });
        }
      }

      incomingTopicArray.data.map((value) => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
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
          outgoingTopicArray.data[outgoingTopicArray.data.length - 1].timestamp - outgoingTopicArray.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      };
      const lengthOfData = 6 * 60 - getCurrentLengthOfData();
      const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

      if (lengthOfData <= 360) {
        for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
          const newTimestamp = outgoingTopicArray.data[0].timestamp - (lengthOfDataPer5Mins - i) * (5 * 60000);
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          line.push({ name: outgoingTopicArray.name, x: time, y: 0 });
        }
      }

      outgoingTopicArray.data.map((value) => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
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

  return (
    <Card>
      <ChartToolbar
        showTopicFilter={true}
        title={t('metrics.topic_metrics')}
        setTimeInterval={setTimeInterval}
        showTopicToolbar={noTopics && metricsDataUnavailable}
      />
      <CardTitle component="h2">{t('metrics.byte_rate')}</CardTitle>
      <CardBody>
        <div ref={containerRef}>
          <div>
            {!chartDataLoading ? (
              !metricsDataUnavailable ? (
                !noTopics ? (
                  chartData &&
                  legend &&
                  largestByteSize && (
                    <Chart
                      ariaDesc={t('metrics.byte_rate')}
                      ariaTitle="Byte rate"
                      containerComponent={
                        <ChartVoronoiContainer
                          labels={({ datum }) => `${datum.name}: ${datum.y}`}
                          constrainToVisibleArea
                        />
                      }
                      legendAllowWrap={true}
                      legendPosition="bottom-left"
                      legendComponent={<ChartLegend data={legend} itemsPerRow={itemsPerRow} />}
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
                        tickFormat={(t) => `${Math.round(t)} ${largestByteSize}/s`}
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
        </div>
      </CardBody>
    </Card>
  );
};
