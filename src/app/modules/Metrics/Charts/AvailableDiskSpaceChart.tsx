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
  ChartArea,
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
import chart_color_black_500 from '@patternfly/react-tokens/dist/js/chart_color_black_500';
import { format } from 'date-fns';
import byteSize from 'byte-size';

export type Broker = {
  name: string
  data: {
    timestamp: number
    usedSpaceAvg: number[]
  }[]
}

export type ChartData = {
  color: string
  softLimitColor: string
  area: BrokerChartData[]
  softLimit: BrokerChartData[]
}

export type BrokerChartData = {
  name: string
  x: string
  y: number 
}

export type LegendData = {
  name: string
  symbol: {}
}

export type AvailableDiskSpaceChartProps = {
  brokers: Broker[]
}

export const AvailableDiskSpaceChart = () => {

  const kafkaInstanceID = '1rRefr8MyPeaptqXORZ5Jk6kP1t';

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
  const softLimitColor = chart_color_black_500.value;

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
        const data = await apisService.getMetricsByRangeQuery(kafkaInstanceID, 6 * 60, 5 * 60, ['kubelet_volume_stats_available_bytes']);
        const avgBroker = {
          name: `Available disk space`,
          data: []
        } as Broker;

        data.data.items?.forEach((item, index) => {
          const labels = item.metric;
          if (labels === undefined) {
            throw new Error('item.metric cannot be undefined');
          }
          if (item.values === undefined) {
            throw new Error('item.values cannot be undefined');
          }
          if (labels['__name__'] === 'kubelet_volume_stats_available_bytes') {
            const labels = item.metric;
            const pvcName = labels['persistentvolumeclaim'];
            if (!pvcName.includes('zookeeper')) {

              item.values?.forEach((value, indexJ) => {
                if (value.Timestamp == undefined) {
                  throw new Error('timestamp cannot be undefined');
              }
                const hardLimit = 225 * 1024 * 1024 * 1024 * .95;
                const usedSpaceInBytes = [hardLimit - value.Value];

                if(index > 0) {
                  let newArray = avgBroker.data[indexJ].usedSpaceAvg.concat(usedSpaceInBytes);
                  avgBroker.data[indexJ].usedSpaceAvg = newArray;
                }
                else {
                  avgBroker.data.push({
                    timestamp: value.Timestamp,
                    usedSpaceAvg: usedSpaceInBytes,
                  });
                }
            });
          }
        }
      });
      getChartData(avgBroker);
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

  const getChartData = (avgBroker) => {
    const legendData: Array<LegendData> = [
      {name: 'Limit', symbol: { fill: chart_color_black_500.value, type: 'threshold'}},
      {name: avgBroker.name, symbol: { fill: colors[0]}}
    ];
    const color = colors[0];
    let chartData: Array<ChartData> = [];
    let area: Array<BrokerChartData> = [];
    let softLimit: Array<BrokerChartData> = [];

    const average = (nums) => {
      return nums.reduce((a, b) => (a + b)) / nums.length;
    }
    avgBroker.data.map(value => {
      const date = new Date(value.timestamp);
      const time = format(date, 'hh:mm');
      const usedSpace = byteSize(average(value.usedSpaceAvg));
      console.log('what is usedSpace' + usedSpace);
      area.push({ name: avgBroker.name, x: time, y: parseInt(usedSpace, 10)});
      softLimit.push({ name: 'Soft limit', x: time, y: 20 });
    });
    chartData.push({ color, softLimitColor, area, softLimit });
    setLegend(legendData);
    setChartData(chartData);
  }

  console.log('what is chartData' + JSON.stringify(chartData)); 

    return (
      <Card>
        <CardTitle>
          {t('metrics.available_disk_space')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
            {chartData && legend && width ? (
              <Chart
                ariaDesc={t('metrics.available_disk_space')}
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
                  bottom: 80, // Adjusted to accomodate legend
                  left: 60,
                  right: 0,
                  top: 25
                }}
                themeColor={ChartThemeColor.multiUnordered}
                width={width}
                minDomain={{ y: 0 }}
              >
                <ChartAxis label={'Time'} tickCount={5} />
                <ChartAxis
                  dependentAxis
                  tickFormat={(t) => `${Math.round(t)} Gi`}
                />
                  <ChartGroup>
                    {chartData.map((value, index) => (
                      <ChartArea
                        key={`chart-area-${index}`}
                        data={value.area}
                        interpolation="monotoneX"
                        style={{
                          data: {
                            stroke: value.color
                          }
                        }}
                      />
                    ))}
                  </ChartGroup>
                  <ChartThreshold
                    key={`chart-softlimit`}
                    data={chartData[0].softLimit}
                    style={{
                      data: {
                        stroke: chartData[0].softLimitColor
                      }
                    }}
                  />
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
