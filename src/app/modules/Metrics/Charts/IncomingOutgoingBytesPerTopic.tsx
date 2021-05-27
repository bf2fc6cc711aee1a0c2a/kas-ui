import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultApi } from 'src/openapi';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { 
  AlertVariant,
  Grid,
  GridItem
} from '@patternfly/react-core';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_blue_200 from '@patternfly/react-tokens/dist/js/chart_color_blue_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_orange_200 from '@patternfly/react-tokens/dist/js/chart_color_orange_200';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_orange_400 from '@patternfly/react-tokens/dist/js/chart_color_orange_400';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';
import { format } from 'date-fns';
import byteSize from 'byte-size';
// import { IncomingBytesPerTopicChart } from './IncomingBytesPerTopicChart';
// import { OutgoingBytesPerTopicChart } from './OutgoingBytesPerTopicChart';
import { useTimeout } from '@app/hooks/useTimeout';
import { getLargestByteSize, convertToSpecifiedByte, getMaxValueOfArray} from './utils';
import { 
  Bullseye,
  Card,
  CardTitle,
  CardBody,
  Spinner
} from '@patternfly/react-core';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer
} from '@patternfly/react-charts';
import { ChartEmptyState } from './ChartEmptyState';

type Topic = {
  name: string
  data: {
    timestamp: number
    bytes: number[]
  }[]
}


type ChartData = {
  color: string
  line: TopicChartData[]
}

type TopicChartData = {
  name: string
  x: string
  y: number 
}

type LegendData = {
  name: string
  symbol: {}
}

type KafkaInstanceProps = {
  kafkaID: string
}

export const IncomingOutgoingBytesPerTopic: React.FC<KafkaInstanceProps> = ({kafkaID}: KafkaInstanceProps) => {

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const containerRef = useRef();

  const [width, setWidth] = useState();

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
  const [maxValueInDataSets, setMaxValueInDataSets] = useState();
  const [noTopics, setNoTopics] = useState();
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(true);

  // const incomingBytesColors = [chart_color_blue_100.value, chart_color_blue_200.value, chart_color_blue_300.value, chart_color_blue_400.value, chart_color_blue_500.value];
  // const outgoingBytesColors = [chart_color_orange_100.value, chart_color_orange_200.value, chart_color_orange_300.value, chart_color_orange_400.value, chart_color_orange_500.value];

  const fetchBytesData = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath
        });
        if (!kafkaID) {
          return;
        }
        const data = await apisService.getMetricsByRangeQuery(kafkaID, 6 * 60, 5 * 60, ['kafka_server_brokertopicmetrics_bytes_in_total', 'kafka_server_brokertopicmetrics_bytes_out_total']);
        
        console.log('what is data Incoming Outgoing' + JSON.stringify(data));

        const incomingTopics = {
          name: "Total incoming topics",
          data: []
        } as Topic;

        const outgoingTopics = {
          name: "Total outgoing topics",
          data: []
        } as Topic;

        if(data.data.items) {
          setMetricsDataUnavailable(false);
          data.data.items?.forEach((item, index) => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }
 
            if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total') {
              // const topicName = labels.topic;

              item.values?.forEach((value, indexJ) => {
                if (value.Timestamp == undefined) {
                  throw new Error('timestamp cannot be undefined');
                }

                if(index > 0) {
                  let newArray = incomingTopics.data[indexJ].bytes.concat(value.Value);
                  incomingTopics.data[indexJ].bytes = newArray;
                }
                else {
                  incomingTopics.data.push({
                    timestamp: value.Timestamp,
                    bytes: [value.Value],
                  });
                }
              })
            }

          if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total') {
            // const topicName = labels.topic;

            console.log('does it make it HERE')

            item.values?.forEach((value, indexJ) => {
              if (value.Timestamp == undefined) {
                throw new Error('timestamp cannot be undefined');
              }

              if(index > 0) {
                let newArray = outgoingTopics.data[indexJ].bytes.concat(value.Value);
                outgoingTopics.data[indexJ].bytes = newArray;
              }
              else {
                outgoingTopics.data.push({
                  timestamp: value.Timestamp,
                  bytes: [value.Value],
                });
              }
            }
            );
          }

          console.log('what is outgoingTopics' + JSON.stringify(outgoingTopics));

        });

        console.log('what is incomingTopics' + incomingTopics)
        console.log('what is outgoingTopics' + outgoingTopics)

        // Check if atleast on topic exists that isn't Strimzi Canary or Consumer Offsets - Keep this here for testing purposes
        // const filteredTopicsIncoming = incomingBytesTopicArray.filter(topic => topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets' );
        // const filteredTopicsOutgoing = incomingBytesTopicArray.filter(topic => topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets' );
        // const filteredTopicsIncoming = incomingBytesTopicArray.filter(topic => topic.name !== '' && topic.name !== '' );
        // const filteredTopicsOutgoing = incomingBytesTopicArray.filter(topic => topic.name !== '' && topic.name !== '' );

          // if(filteredTopicsIncoming.length < 1) {
          //   setNoTopics(true);
          // }

          getChartData(incomingTopics, outgoingTopics);
      }

      else {
        setMetricsDataUnavailable(true);
        setChartDataLoading(false);
      }

      } catch (error) {
      let reason: string | undefined;
      if (isServiceApiError(error)) {
        reason = error.response?.data.reason;
      }
      console.log('what is the error' + error)
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  };

  useEffect(() => {
    fetchBytesData();
  }, []);

  useTimeout(() => fetchBytesData(), 1000 * 60 * 5);

  const getChartData = (incomingTopicArray, outgoingTopicArray) => {

    console.log('what is incomingTopicArray' + incomingTopicArray)
  
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    let largestByteSizeIncoming = getLargestByteSize(incomingTopicArray);
    console.log('what is largestByteSizeIncoming' + largestByteSizeIncoming)
    let largestByteSizeOutgoing = getLargestByteSize(outgoingTopicArray);
    // Need to work out which is the largest byte size 


    // Aggregate of Incoming Bytes per Topic
    if (incomingTopicArray) {
      let line: Array<TopicChartData> = [];
      let color = chart_color_blue_100.value;

      const getCurrentLengthOfData = () => {
        let timestampDiff = incomingTopicArray.data[incomingTopicArray.data.length - 1].timestamp - incomingTopicArray.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      }
      let lengthOfData = (6 * 60) - getCurrentLengthOfData();
      let lengthOfDataPer5Mins = ((6 * 60) - getCurrentLengthOfData()) / 5;
    
      if (lengthOfData <= 360) {
        for (var i = 0; i < lengthOfDataPer5Mins; i = i+1) {
          const newTimestamp = (incomingTopicArray.data[0].timestamp - ((lengthOfDataPer5Mins - i) * (5 * 60000)));
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          line.push({ name: incomingTopicArray.name, x: time, y: 0})
        }
      }

      incomingTopicArray.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const aggregateBytes = value.bytes.reduce(function(a, b) { return a + b }, 0);
        const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
        line.push({ name: value.name, x: time, y: bytes});
      });

      chartData.push({ color, line });
  
      legendData.push({
        name: incomingTopicArray.name,
        symbol: {
          fill: chart_color_blue_100.value
        }
      })
    }

    // Aggregate of Outgoing Bytes per Topic
    if (outgoingTopicArray) {
      let line: Array<TopicChartData> = [];
      let color = chart_color_orange_100.value;

      const getCurrentLengthOfData = () => {
        let timestampDiff = outgoingTopicArray.data[outgoingTopicArray.data.length - 1].timestamp - outgoingTopicArray.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      }
      let lengthOfData = (6 * 60) - getCurrentLengthOfData();
      let lengthOfDataPer5Mins = ((6 * 60) - getCurrentLengthOfData()) / 5;
    
      if (lengthOfData <= 360) {
        for (var i = 0; i < lengthOfDataPer5Mins; i = i+1) {
          const newTimestamp = (outgoingTopicArray.data[0].timestamp - ((lengthOfDataPer5Mins - i) * (5 * 60000)));
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          line.push({ name: outgoingTopicArray.name, x: time, y: 0})
        }
      }

      outgoingTopicArray.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const aggregateBytes = value.bytes.reduce(function(a, b) { return a + b }, 0);
        const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
        line.push({ name: value.name, x: time, y: bytes});
      });

      chartData.push({ color, line });
  
      legendData.push({
        name: outgoingTopicArray.name,
        symbol: {
          fill: chart_color_orange_100.value
        }
      })
    }


    // topicArray.map((topic, index) => {
    //   const color = type === 'incoming' ? incomingBytesColors[index] : outgoingBytesColors[index];
    //   legendData.push({
    //     name: topic.name,
    //     symbol: {
    //       fill: color
    //     }
    //   });
    //   maxValuesInTopics.push(getMaxValueOfArray(topic.data));
    //   let line: Array<TopicChartData> = [];

    //   const getCurrentLengthOfData = () => {
    //     let timestampDiff = topic.data[topic.data.length - 1].timestamp - topic.data[0].timestamp;
    //     const minutes = timestampDiff / 1000 / 60;
    //     return minutes;
    //   }
    //   let lengthOfData = (6 * 60) - getCurrentLengthOfData();
    //   let lengthOfDataPer5Mins = ((6 * 60) - getCurrentLengthOfData()) / 5;
    
    //   if (lengthOfData <= 360) {
    //     for (var i = 0; i < lengthOfDataPer5Mins; i = i+1) {
    //       const newTimestamp = (topic.data[0].timestamp - ((lengthOfDataPer5Mins - i) * (5 * 60000)));
    //       const date = new Date(newTimestamp);
    //       const time = format(date, 'hh:mm');
    //       line.push({ name: topic.name, x: time, y: 0})
    //     }
    //   }
    //   topic.data.map(value => {
    //     const date = new Date(value.timestamp);
    //     const time = format(date, 'hh:mm');
    //     const bytes = convertToSpecifiedByte(value.bytes, largestByteSize);
    //     line.push({ name: value.name, x: time, y: bytes});
    //   });
    //   chartData.push({ color, line });
    // });
    // const maxValueData: number = convertToSpecifiedByte(Math.max(...maxValuesInTopics), largestByteSize);
    
    setLegend(legendData);
    setChartData(chartData);
    setLargestByteSize(largestByteSize);
    setChartDataLoading(false);
  }

    return (
      <Card>
        <CardTitle component="h2">
          {t('metrics.byte_rate')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
            <div>
            { !chartDataLoading ? (
              !metricsDataUnavailable ? (
                !noTopics ? (
                chartData && legend && largestByteSize &&
                <Chart
                  ariaDesc={t('metrics.byte_rate')}
                  ariaTitle="Incoming bytes"
                  containerComponent={
                    <ChartVoronoiContainer
                      labels={({ datum }) => `${datum.name}: ${datum.y}`}
                      constrainToVisibleArea
                    />
                  }
                  legendAllowWrap={true}
                  legendPosition="bottom-left"
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
                    top: 25
                  }}
                  themeColor={ChartThemeColor.multiUnordered}
                  width={width}
                >
                  <ChartAxis label={'Time'} tickCount={6} />
                  <ChartAxis
                    dependentAxis
                    tickFormat={(t) => `${Math.round(t)} ${largestByteSize}/s`}
                    tickCount={4}
                    domain={{ y: [0, maxValueInDataSets]}}
                    minDomain={{ y: 0 }}

                  />
                  <ChartGroup>
                    {chartData.map((value, index) => (
                      <ChartLine
                        key={`chart-line-${index}`}
                        data={value.line}
                        style={{
                          data: {
                            stroke: value.color
                          }
                        }}
                      />
                    ))}
                  </ChartGroup>
                  </Chart>
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
                <Spinner isSVG/>
              </Bullseye>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
