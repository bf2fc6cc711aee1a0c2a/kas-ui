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
import { IncomingBytesPerTopicChart } from './IncomingBytesPerTopicChart';
import { OutgoingBytesPerTopicChart } from './OutgoingBytesPerTopicChart';
import { useTimeout } from '@app/hooks/useTimeout';
import { getLargestByteSize, convertToSpecifiedByte, getMaxValueOfArray} from './utils';

type Topic = {
  name: string
  data: {
    name: string
    timestamp: number
    bytes: number
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
  const [incomingBytesLegend, setIncomingBytesLegend] = useState()
  const [incomingBytesChartData, setIncomingBytesChartData] = useState<ChartData[]>();
  const [outgoingBytesLegend, setOutgoingBytesLegend] = useState()
  const [outgoingBytesChartData, setOutgoingBytesChartData] = useState<ChartData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const [maxValueInDataSets, setMaxValueInDataSets] = useState();
  const [noTopics, setNoTopics] = useState();

  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(true);

  const incomingBytesColors = [chart_color_blue_100.value, chart_color_blue_200.value, chart_color_blue_300.value, chart_color_blue_400.value, chart_color_blue_500.value];
  const outgoingBytesColors = [chart_color_orange_100.value, chart_color_orange_200.value, chart_color_orange_300.value, chart_color_orange_400.value, chart_color_orange_500.value];

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

        let incomingBytesTopicArray: Topic[] = [];
        let outgoingBytesTopicArray: Topic[] = [];

        if(data.data.items) {
          setMetricsDataUnavailable(false);
          data.data.items?.forEach((item, i) => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }
            if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total') {
              const topicName = labels.topic;
              const topic = {
                name: topicName,
                data: []
              } as Topic;

              const isTopicInArray = incomingBytesTopicArray.some(t => t.name === topicName);
              item.values?.forEach(value => {
                if (value.Timestamp == undefined) {
                  throw new Error('timestamp cannot be undefined');
                }

                if(isTopicInArray) {
                  incomingBytesTopicArray.map((topic) => {
                    if(topic.name === topicName) {
                      topic.data.forEach((datum) => {
                        datum.bytes = datum.bytes + value.Value;
                      })
                    }
                  })
                }
                else {
                  topic.data.push({
                    name: topicName,
                    timestamp: value.Timestamp,
                    bytes: value.Value
                  });
                }
              })

              if(!isTopicInArray) {
                incomingBytesTopicArray.push(topic);
              }
          }
          if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total') {
            const topicName = labels.topic;
            const topic = {
              name: topicName,
              data: []
            } as Topic;

            const isTopicInArray = outgoingBytesTopicArray.some(t => t.name === topicName);
            item.values?.forEach(value => {
              if (value.Timestamp == undefined) {
                throw new Error('timestamp cannot be undefined');
              }
              if(isTopicInArray) {
                outgoingBytesTopicArray.map((topic) => {
                  if(topic.name === topicName) {
                    topic.data.forEach((datum) => {
                      datum.bytes = datum.bytes + value.Value;
                    })
                  }
                })
              }
              else {
                topic.data.push({
                  name: topicName,
                  timestamp: value.Timestamp,
                  bytes: value.Value
                });
              }
            })
            if(!isTopicInArray) {
              outgoingBytesTopicArray.push(topic);
            }
          }
          });

          // Check if atleast on topic exists that isn't Strimzi Canary or Consumer Offsets - Keep this here for testing purposes
          const filteredTopicsIncoming = incomingBytesTopicArray.filter(topic => topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets' );
          const filteredTopicsOutgoing = incomingBytesTopicArray.filter(topic => topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets' );

          if(filteredTopicsIncoming.length < 1) {
            setNoTopics(true);
          }
          getChartData(filteredTopicsIncoming, 'incoming');
          getChartData(filteredTopicsOutgoing, 'outgoing');
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
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  };

  useEffect(() => {
    fetchBytesData();
  }, []);

  useTimeout(() => fetchBytesData(), 1000 * 60 * 5);

  const getChartData = (topicArray, type) => {
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    let largestByteSize = getLargestByteSize(topicArray);
    let maxValuesInTopics: Array<number> = [];
    topicArray.map((topic, index) => {
      const color = type === 'incoming' ? incomingBytesColors[index] : outgoingBytesColors[index];
      legendData.push({
        name: topic.name,
        symbol: {
          fill: color
        }
      });
      maxValuesInTopics.push(getMaxValueOfArray(topic.data));
      let line: Array<TopicChartData> = [];

      const getCurrentLengthOfData = () => {
        let timestampDiff = topic.data[topic.data.length - 1].timestamp - topic.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      }
      let lengthOfData = (6 * 60) - getCurrentLengthOfData();
      let lengthOfDataPer5Mins = ((6 * 60) - getCurrentLengthOfData()) / 5;
    
      if (lengthOfData <= 360) {
        for (var i = 0; i < lengthOfDataPer5Mins; i = i+1) {
          const newTimestamp = (topic.data[0].timestamp - ((lengthOfDataPer5Mins - i) * (5 * 60000)));
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          line.push({ name: topic.name, x: time, y: 0})
        }
      }
      topic.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const bytes = convertToSpecifiedByte(value.bytes, largestByteSize);
        line.push({ name: value.name, x: time, y: bytes});
      });
      chartData.push({ color, line });
    });
    const maxValueData: number = convertToSpecifiedByte(Math.max(...maxValuesInTopics), largestByteSize);
    if (type === 'incoming') {
      setIncomingBytesLegend(legendData);
      setIncomingBytesChartData(chartData);
      setLargestByteSize(largestByteSize);
      setMaxValueInDataSets(maxValueData);
    }
    if (type === 'outgoing') {
      setOutgoingBytesLegend(legendData);
      setOutgoingBytesChartData(chartData);
      setLargestByteSize(largestByteSize);
      if(maxValueData > maxValueInDataSets) {
        setMaxValueInDataSets(maxValueData);
      }
      setChartDataLoading(false);
    }
  }

    return (
      <>
        <Grid lg={12} hasGutter>
          <GridItem sm={12} lg={6}>
            <IncomingBytesPerTopicChart
              chartData={incomingBytesChartData}
              legend={incomingBytesLegend}
              byteSize={largestByteSize}
              maxValueInDataSets={maxValueInDataSets}
              metricsDataUnavailable={metricsDataUnavailable}
              chartDataLoading={chartDataLoading}
              noTopics={noTopics}
            />
          </GridItem>
          <GridItem sm={12} lg={6}>
            <OutgoingBytesPerTopicChart
              chartData={outgoingBytesChartData}
              legend={outgoingBytesLegend}
              byteSize={largestByteSize}
              maxValueInDataSets={maxValueInDataSets}
              metricsDataUnavailable={metricsDataUnavailable}
              chartDataLoading={chartDataLoading}
              noTopics={noTopics}
            />
          </GridItem>
        </Grid>
     </>
  );
}
