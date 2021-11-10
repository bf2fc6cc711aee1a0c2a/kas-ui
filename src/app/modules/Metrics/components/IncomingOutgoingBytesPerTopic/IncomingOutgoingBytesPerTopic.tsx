import {
  ChartEmptyState,
  ChartPopover,
  ChartToolbar,
  LogSizePerPartitionChart,
} from '@app/modules/Metrics/components';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Spinner,
} from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TopicDataArray } from './fetchBytesData';
import { useBytesDataChart } from './useBytesDataChart';

type IncomingOutgoingBytesPerTopicProps = {
  kafkaID: string;
  topicList: string[];
  incomingTopicsData: TopicDataArray;
  outgoingTopicsData: TopicDataArray;
  timeDuration: number;
  timeInterval: number;
  metricsDataUnavailable: boolean;
  isLoading: boolean;
  selectedTopic: string | boolean;
  onCreateTopic: () => void;
  onRefresh: () => void;
  onSelectedTopic: (topic: string | boolean) => void;
  onTimeDuration: (duration: number) => void;
  onTimeInterval: (interval: number) => void;
};

export const IncomingOutgoingBytesPerTopic: React.FC<IncomingOutgoingBytesPerTopicProps> =
  ({
    kafkaID,
    topicList,
    incomingTopicsData,
    outgoingTopicsData,
    selectedTopic,
    timeDuration,
    timeInterval,
    metricsDataUnavailable,
    isLoading,
    onCreateTopic,
    onRefresh,
    onSelectedTopic,
    onTimeDuration,
    onTimeInterval,
  }) => {
    const { t } = useTranslation();
    // const { addAlert } = useAlert() || {};
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number>();

    const handleResize = () =>
      containerRef.current && setWidth(containerRef.current.clientWidth);
    const itemsPerRow = width && width > 650 ? 6 : 3;

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    }, [width]);

    const { getChartData } = useBytesDataChart();

    const { chartData, legendData, largestByteSize } = getChartData(
      incomingTopicsData,
      outgoingTopicsData,
      timeDuration
    );

    const noTopics = topicList.length === 0;

    return (
      <Card>
        <ChartToolbar
          showTopicFilter={true}
          title={t('metrics.topic_metrics')}
          setTimeDuration={onTimeDuration}
          setTimeInterval={onTimeInterval}
          showTopicToolbar={!noTopics && !metricsDataUnavailable}
          selectedTopic={selectedTopic}
          setSelectedTopic={onSelectedTopic}
          onRefreshTopicToolbar={onRefresh}
          topicList={topicList}
          setIsFilterApplied={() => false}
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
              {!isLoading ? (
                !metricsDataUnavailable ? (
                  !noTopics ? (
                    chartData &&
                    legendData &&
                    largestByteSize && (
                      <>
                        <Chart
                          ariaTitle={t('metrics.total_bytes')}
                          containerComponent={
                            <ChartVoronoiContainer
                              labels={({ datum }) =>
                                `${datum.name}: ${datum.y}`
                              }
                              constrainToVisibleArea
                            />
                          }
                          legendAllowWrap={true}
                          legendPosition='bottom-left'
                          legendComponent={
                            <ChartLegend
                              data={legendData}
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
                          <ChartAxis label={'\n' + 'Time'} tickCount={6} />
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
