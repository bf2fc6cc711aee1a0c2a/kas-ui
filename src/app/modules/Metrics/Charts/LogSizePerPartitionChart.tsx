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
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';
import chart_color_green_500 from '@patternfly/react-tokens/dist/js/chart_color_green_500';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_green_100 from '@patternfly/react-tokens/dist/js/chart_color_green_100';
import chart_color_black_300 from '@patternfly/react-tokens/dist/js/chart_color_black_300';
import { format } from 'date-fns';

export type Partition = {
  name: string
  data: {
    timestamp: number
    logSize: number
  }[]
}

export type ChartData = {
  color: string
  area: PartitionChartData[]
}

export type PartitionChartData = {
  name: string
  x: string
  y: number 
}

export type LegendData = {
  name: string
  symbol: {}
}

export const LogSizePerPartitionChart = (kafkaID) => {

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

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

  // Functions
  const fetchLogSizePerPartition = async () => {
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
        const data = await apisService.getMetricsByRangeQuery('1rAvUD7CFXIm2M3mj2pjtpHExWw', 6 * 60, 5 * 60, ['kafka_log_log_size']);
        console.log('what is log size data' + JSON.stringify(data));
        let partitionArray = [];

        data.data.items?.forEach((item, i) => {
          const partition = {
            name: `Topic name: Partition ${i + 1}`,
            data: []
          } as Partition;
          item.values?.forEach(value => {
            if (value.Timestamp == undefined) {
              throw new Error('timestamp cannot be undefined');
            }
            partition.data.push({
              timestamp: value.Timestamp,
              logSize: value.Value
            });
        });
        partitionArray.push(partition);
      })

      getChartData(partitionArray);

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
    fetchLogSizePerPartition();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const getChartData = (partitionArray) => {
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    console.log('does it here partition array ' + partitionArray);
    partitionArray.map((partition, index) => {
      const color = colors[index];

      legendData.push({
        name: partition.name.charAt(0).toUpperCase() + partition.name.slice(1),
        symbol: {
          fill: color
        }
      });
      let area: Array<PartitionChartData> = [];
      partition.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        area.push({ name: value.name, x: time, y: (value.logSize / 1024 / 1024 / 1024) });
      });
      chartData.push({ color, area });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

    return (
      <>
      {chartData && legend && (
      <Card>
        <CardTitle>
          {t('metrics.log_size_per_partition')}
        </CardTitle>
        <CardBody>
          <div ref={containerRef}>
              <Chart
                ariaDesc={t('metrics.log_size_per_partition')}
                ariaTitle="Log Size"
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
                  tickFormat={(t) => `${Math.round(t)} GiB`}
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
              </Chart>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}
