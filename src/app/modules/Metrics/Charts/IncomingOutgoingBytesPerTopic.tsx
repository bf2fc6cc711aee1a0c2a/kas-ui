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
  // const itemsPerRow = width && width > 400 ? 4 : 2;
  const incomingBytesColors = [chart_color_blue_100.value, chart_color_blue_200.value, chart_color_blue_300.value, chart_color_blue_400.value, chart_color_blue_500.value];
  const outgoingBytesColors = [chart_color_orange_100.value, chart_color_orange_200.value, chart_color_orange_300.value, chart_color_orange_400.value, chart_color_orange_500.value];

  const getLargestByteSize = (data) => {
    let currentByteSize = "B";
    data.forEach(value => {
      const byteString = byteSize(value.bytes).unit;
      console.log('what is bytestring incomeoutg' + byteString);
      if(byteString === "kB") {
        if (currentByteSize === "B") {
          currentByteSize = "KB";
        }
      }
      if(byteString === "MB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB') {
          currentByteSize = "MB";
        }
      }
      if(byteString === "GB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB' || currentByteSize === 'MB') {
          currentByteSize = "GB";
        }
      }
    })
    return currentByteSize;
  }

  const convertToSpecifiedByte = (bytes, largestByteSize) => {
    console.log('what is bytes type' + bytes + largestByteSize);
    if(largestByteSize === 'B') {
      return Math.round(bytes * 10) / 10
    }
    if(largestByteSize === 'KB') {
      return Math.round(bytes / 1024 * 10) / 10
    }
    if(largestByteSize === 'MB') {
      return Math.round(bytes / 1024 / 1024 * 10) / 10
    }
    if(largestByteSize === 'GB') {
      return Math.round(bytes / 1024 / 1024 / 1024 * 10) / 10
    }
  }

  const getMaxValueOfArray = (data) => {
    const max = data.reduce(function(prev, current) {
      return (prev.bytes > current.bytes) ? prev : current
    })
    console.log('what is max' + max.bytes);
    return max.bytes;
  }

  console.log('WHAT IS MAX' + maxValueInDataSets);

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

        let incomingBytesTopicArray: Topic[] = [];
        let outgoingBytesTopicArray: Topic[] = [];
        data.data.items?.forEach((item, i) => {
          const labels = item.metric;
          if (labels === undefined) {
            throw new Error('item.metric cannot be undefined');
          }
          if (item.values === undefined) {
            throw new Error('item.values cannot be undefined');
          }
          if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total') {
            const topic = {
              name: `Topic ${i + 1}`,
              data: []
            } as Topic;
            item.values?.forEach(value => {
              if (value.Timestamp == undefined) {
                throw new Error('timestamp cannot be undefined');
              }
              topic.data.push({
                name: `Topic ${i + 1}`,
                timestamp: value.Timestamp,
                bytes: value.Value
              });
          });
          incomingBytesTopicArray.push(topic);
        }
        if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total') {
          const topic = {
            name: `Topic ${i + 1}`,
            data: []
          } as Topic;
          item.values?.forEach(value => {
            if (value.Timestamp == undefined) {
              throw new Error('timestamp cannot be undefined');
            }
            topic.data.push({
              name: `Topic ${i + 1}`,
              timestamp: value.Timestamp,
              bytes: value.Value
            });
        });
        outgoingBytesTopicArray.push(topic);
      }
      });
      getChartData(incomingBytesTopicArray, 'incoming');
      getChartData(outgoingBytesTopicArray, 'outgoing');
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

  const getChartData = (topicArray, type) => {
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    let largestByteSize: string = "";
    let maxValuesInTopics: Array<number> = [];
    topicArray.map((topic, index) => {
      const color = type === 'incoming' ? incomingBytesColors[index] : outgoingBytesColors[index];

      legendData.push({
        name: topic.name,
        symbol: {
          fill: color
        }
      });
      largestByteSize = getLargestByteSize(topic.data);
      maxValuesInTopics.push(getMaxValueOfArray(topic.data));
      let line: Array<TopicChartData> = [];
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
            />
          </GridItem>
          <GridItem sm={12} lg={6}>
            <OutgoingBytesPerTopicChart
              chartData={outgoingBytesChartData}
              legend={outgoingBytesLegend}
              byteSize={largestByteSize}
              maxValueInDataSets={maxValueInDataSets}
            />
          </GridItem>
          </Grid>
      </>
  );
}
