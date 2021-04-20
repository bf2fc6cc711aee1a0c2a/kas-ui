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
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import { format } from 'date-fns';
import byteSize from 'byte-size';

export type Partition = {
  name: string
  data: {
    timestamp: number
    logSize: number
    name: string
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

export const LogSizePerPartitionChart = () => {

  const kafkaInstanceID = '1rGPabXMVG7cSONKOdPk0eAY2mZ';

  const containerRef = useRef();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState()
  const [chartData, setChartData] = useState<ChartData[]>();
  const itemsPerRow = 4;
  const colors = [chart_color_blue_300.value, chart_color_green_300.value, chart_color_blue_300.value, chart_color_green_300.value];

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
        if (!kafkaInstanceID) {
          return;
        }
        const data = await apisService.getMetricsByRangeQuery(kafkaInstanceID, 6 * 60, 5 * 60, ['kafka_log_log_size']);
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
              name: `Topic name: Partition ${i + 1}`,
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
    handleResize();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const getChartData = (partitionArray) => {
    let legendData: Array<LegendData> = [];
    let chartData: Array<ChartData> = [];
    partitionArray.map((partition, index) => {
      const color = colors[index];

      legendData.push({
        name: partition.name,
        symbol: {
          fill: color
        }
      });
      let area: Array<PartitionChartData> = [];
      partition.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const logSize = byteSize(value.logSize);
        console.log('what is the log size' + logSize);
        area.push({ name: value.name, x: time, y: logSize.value });
      });
      chartData.push({ color, area });
    });
    setLegend(legendData);
    setChartData(chartData);
  }

  return (
    <Card>
      <CardTitle>
        {t('metrics.log_size_per_partition')}
      </CardTitle>
      <CardBody>
      <div ref={containerRef}>
        {chartData && legend && width ? (
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
              // tickValues={['200 KB', '400 KB', '600 KB', '800 KB', '1000 KB']}
              tickFormat={(t, name) => `${Math.round(t)} MiB`}
              tickCount={4}
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
          ) : (
            <Bullseye>
              <Spinner isSVG />
            </Bullseye>
          )
          }
        </div>
      </CardBody>
    </Card>
  );
}
