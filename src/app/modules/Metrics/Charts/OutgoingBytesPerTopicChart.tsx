import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultApi } from 'src/openapi';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { 
  AlertVariant,
  Card,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import {
  Chart,
  ChartLine,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartThreshold,
  ChartVoronoiContainer
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';
import chart_color_green_500 from '@patternfly/react-tokens/dist/js/chart_color_green_500';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_green_100 from '@patternfly/react-tokens/dist/js/chart_color_green_100';
import chart_color_black_300 from '@patternfly/react-tokens/dist/js/chart_color_black_300';
import { format } from 'date-fns';

export type Topic = {
  name: string
  data: {
    timestamp: number
    bytes: number
  }[]
}

export type ChartData = {
  color: string
  line: TopicChartData[]
}

export type TopicChartData = {
  name: string
  x: string
  y: number 
}

export type LegendData = {
  name: string
  symbol: {}
}

export const OutgoingBytesPerTopicChart = (kafkaID) => {

  const kafkaInstanceID = kafkaID.kafkaID;

  const containerRef = useRef();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState()
  const [chartData, setChartData] = useState<ChartData[]>();
  const itemsPerRow = 4;
  const colors = [chart_color_blue_300.value, chart_color_orange_300.value, chart_color_green_300.value];
  const softLimitColors = [chart_color_blue_100.value, chart_color_orange_100.value, chart_color_green_100.value];

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

  const fetchAvailableDiskSpaceMetrics = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath
        });
        // if (!kafkaInstanceID) {
        //   return;
        // }
        const data = await apisService.getMetricsByRangeQuery('1rAvUD7CFXIm2M3mj2pjtpHExWw', 6 * 60, 5 * 60, ['kafka_server_brokertopicmetrics_bytes_out_total']);
        let topicArray: Topic[] = [];
        data.data.items?.forEach((item, i) => {
          const labels = item.metric;
          if (labels === undefined) {
            throw new Error('item.metric cannot be undefined');
          }
          if (item.values === undefined) {
            throw new Error('item.values cannot be undefined');
          }
          if (labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total') {
            const topic = {
              name: `topic ${i + 1}`,
              data: []
            } as Topic;
            item.values?.forEach(value => {
              if (value.Timestamp == undefined) {
                throw new Error('timestamp cannot be undefined');
              }
              topic.data.push({
                timestamp: value.Timestamp,
                bytes: value.Value
              });
          });
          topicArray.push(topic);
        }
      });
      getChartData(topicArray);
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
    fetchAvailableDiskSpaceMetrics();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const getChartData = (topicArray) => {
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    topicArray.map((topic, index) => {
      const color = colors[index];
      legendData.push({
        name: topic.name.charAt(0).toUpperCase() + topic.name.slice(1),
        symbol: {
          fill: color
        }
      });
      let line: Array<TopicChartData> = [];
      topic.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        line.push({ name: value.name, x: time, y: (value.bytes / 1024 / 1024 / 1024)});
      });
      chartData.push({ color, line });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

    return (
      <>
      {chartData && legend && (
      <Card>
        <CardTitle>
          {t('metrics.outgoing_bytes_per_topic')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
              <Chart
                ariaDesc={t('metrics.outgoing_bytes_per_topic')}
                ariaTitle="Disk Space"
                containerComponent={
                  <ChartVoronoiContainer
                    labels={({ datum }) => `${datum.name}: ${datum.y}`}
                    constrainToVisibleArea
                  />
                }
                legendPosition="bottom-left"
                legendComponent={
                  <ChartLegend
                    data={legend}
                    itemsPerRow={itemsPerRow}
                  />
                }
                height={300}
                padding={{
                  bottom: 80,
                  left: 60,
                  right: 0,
                  top: 25
                }}
                themeColor={ChartThemeColor.multiUnordered}
                width={width}
              >
                <ChartAxis label={'Time'} tickCount={5} />
                <ChartAxis
                  dependentAxis
                  tickFormat={(t) => `${Math.round(t)} MiB`}
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
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
