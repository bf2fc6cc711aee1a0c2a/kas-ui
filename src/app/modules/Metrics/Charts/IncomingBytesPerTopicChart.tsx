import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultApi } from 'src/openapi';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { 
  AlertVariant,
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
  ChartThreshold,
  ChartVoronoiContainer
} from '@patternfly/react-charts';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_blue_200 from '@patternfly/react-tokens/dist/js/chart_color_blue_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import { format } from 'date-fns';
import byteSize from 'byte-size';

export type Topic = {
  name: string
  data: {
    name: string
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

export const IncomingBytesPerTopicChart = () => {

  const kafkaInstanceID = '1rOuWNysqHyurjYleBN1VfJ6CTu';

  const containerRef = useRef();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState()
  const [chartData, setChartData] = useState<ChartData[]>();
  const itemsPerRow = width && width > 400 ? 4 : 2;
  const colors = [chart_color_blue_100.value, chart_color_blue_200.value, chart_color_blue_300.value, chart_color_blue_400.value, chart_color_blue_500.value];

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

  const fetchAvailableDiskSpaceMetrics = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath
        });
        if (!kafkaInstanceID) {
          return;
        }
        const data = await apisService.getMetricsByRangeQuery(kafkaInstanceID, 6 * 60, 5 * 60, ['kafka_server_brokertopicmetrics_bytes_in_total']);
        
        console.log('what is incoming bytes data' + JSON.stringify(data));

        let topicArray: Topic[] = [];
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
                bytes: byteSize(value.Value)
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
    handleResize();
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
        name: topic.name,
        symbol: {
          fill: color
        }
      });
      let line: Array<TopicChartData> = [];
      topic.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const bytes = value.bytes;
        console.log('what is incoming bytes' + bytes);
        line.push({ name: value.name, x: time, y: bytes.value});
      });
      chartData.push({ color, line });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

    return (
      <Card>
        <CardTitle>
          {t('metrics.incoming_bytes_per_topic')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
            {chartData && legend && width ? (
              <Chart
                ariaDesc={t('metrics.incoming_bytes_per_topic')}
                ariaTitle="Incoming bytes"
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
                legendAllowWrap={true}
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
                  // tickValues={[200,400,600,800]}
                  // tickFormat={(t) => `${Math.round(t)} B/s`}
                  tickCount={4}
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
              <Bullseye>
                <Spinner isSVG/>
              </Bullseye>
            )}
            </div>
          </CardBody>
        </Card>
  );
}
