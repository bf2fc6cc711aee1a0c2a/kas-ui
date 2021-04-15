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
import chart_color_black_300 from '@patternfly/react-tokens/dist/js/chart_color_black_300';
import { format } from 'date-fns';

export type Broker = {
  name: string
  data: {
    timestamp: number
    usedSpace: number
    softLimit: number
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

export const AvailableDiskSpaceChart = (kafkaID) => {

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
  const softLimitColor = 'chart_color_black_300.value';

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
        const data = await apisService.getMetricsByRangeQuery('1rAvUD7CFXIm2M3mj2pjtpHExWw', 6 * 60, 5 * 60, ['kubelet_volume_stats_available_bytes']);
        let brokerArray: Broker[] = [];
        data.data.items?.forEach((item, i) => {
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
              const broker = {
                name: `broker ${i + 1}`,
                data: []
              } as Broker;
              item.values?.forEach(value => {
                if (value.Timestamp == undefined) {
                  throw new Error('timestamp cannot be undefined');
              }
                const hardLimit = 225 * 1024 * 1024 * 1024 * .95;
                const usedSpaceInBytes = hardLimit - value.Value;
                const softLimit = 225 * 1024 * 1024 * 1024 * .90;
                broker.data.push({
                  timestamp: value.Timestamp,
                  usedSpace: usedSpaceInBytes,
                  softLimit
                });
            });
            brokerArray.push(broker);
          }
        }
      });
      getChartData(brokerArray);
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

  const getChartData = (brokerArray) => {
    let legendData: Array<LegendData> = [{name: 'Limit', symbol: { fill: chart_color_black_300.value, type: 'threshold'}}];
    let chartData: Array<ChartData> = [];

    brokerArray.map((broker, index) => {
      const color = colors[index];
      const softLimitName = `${broker.name} limit`;

      legendData.push({
        name: broker.name.charAt(0).toUpperCase() + broker.name.slice(1),
        symbol: {
          fill: color
        }
      });
      let area: Array<BrokerChartData> = [];
      let softLimit: Array<BrokerChartData> = [];
      broker.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        area.push({ name: broker.name, x: time, y: (value.usedSpace / 1024 / 1024 / 1024) * -1 });
        softLimit.push({ name: softLimitName, x: time, y: 20 });
      });
      chartData.push({ color, softLimitColor, area, softLimit });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

    return (
      <>
      {chartData && legend && (
      <Card>
        <CardTitle>
          {t('metrics.available_disk_space_per_broker')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
              <Chart
                ariaDesc={t('metrics.available_disk_space_per_broker')}
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
                {chartData.map((value, index) => (
                  <ChartThreshold
                    key={`chart-softlimit-${index}`}
                    data={value.softLimit}
                    style={{
                      data: {
                        stroke: value.softLimitColor
                      }
                    }}
                  />
                ))}
              </Chart>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
