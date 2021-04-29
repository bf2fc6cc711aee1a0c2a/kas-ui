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
    bytes: number
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
}

export type KafkaInstanceProps = {
  kafkaID: string
}

export const LogSizePerPartitionChart: React.FC<KafkaInstanceProps> = ({kafkaID}: KafkaInstanceProps) => {

  const containerRef = useRef();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const [width, setWidth] = useState();
  const [legend, setLegend] = useState()
  const [chartData, setChartData] = useState<ChartData[]>();
  const [largestByteSize, setLargestByteSize] = useState();
  const colors = [chart_color_green_300.value, chart_color_blue_300.value];

  const handleResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);

  const getLargestByteSize = (data) => {
    let currentByteSize = "B";
    data.forEach(value => {
      const byteString = byteSize(value.bytes).unit;
      console.log('what is bytestring LOG SIZE' + byteString);
      if(byteString === "kB") {
        if (currentByteSize === 'B') {
          currentByteSize = "KB";
        }
      }
      if(byteString === "MB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB')
        currentByteSize = "MB"
      }
      if(byteString === "GB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB' || currentByteSize === 'MB') {
          currentByteSize = "GB"
        }
      }
    })
    return currentByteSize;
  }

  const convertToSpecifiedByte = (bytes, largestByteSize) => {
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

  // Functions
  const fetchLogSizePerPartition = async () => {
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
        const data = await apisService.getMetricsByRangeQuery(kafkaID, 6 * 60, 5 * 60, ['kafka_log_log_size']);
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
              bytes: value.Value
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
    let largestByteSize = "";
    partitionArray.map((partition, index) => {
      const color = colors[index];
      legendData.push({
        name: partition.name
      });
      let area: Array<PartitionChartData> = [];

      largestByteSize = getLargestByteSize(partition.data);

      const getCurrentLengthOfData = () => {
        let timestampDiff = partition.data[partition.data.length - 1].timestamp - partition.data[0].timestamp;
        const minutes = timestampDiff / 1000 / 60;
        return minutes;
      }
      let lengthOfData = (6 * 60) - getCurrentLengthOfData();
      let lengthOfDataPer5Mins = ((6 * 60) - getCurrentLengthOfData()) / 5;
    
      if (lengthOfData < 360) {
        for (var i = 0; i < lengthOfDataPer5Mins; i = i+1) {
          const newTimestamp = (partition.data[0].timestamp - ((lengthOfDataPer5Mins - i) * (5 * 60000)));
          const date = new Date(newTimestamp);
          const time = format(date, 'hh:mm');
          area.push({ name: partition.name, x: time, y: 0})
        }
      }

      partition.data.map(value => {
        const date = new Date(value.timestamp);
        const time = format(date, 'hh:mm');
        const bytes = convertToSpecifiedByte(value.bytes, largestByteSize);
        area.push({ name: value.name, x: time, y: bytes});
      });
      chartData.push({ color, area });
    });
    setLegend(legendData);
    setChartData(chartData);
    setLargestByteSize(largestByteSize);
  }

  return (
    <Card>
      <CardTitle>
        {t('metrics.log_size_per_partition')}
      </CardTitle>
      <CardBody>
      <div ref={containerRef}>
        {chartData && legend && width && largestByteSize ? (
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
              />
            }
            height={300}
            padding={{
              bottom: 80,
              left: 80,
              right: 30,
              top: 25
            }}
            themeColor={ChartThemeColor.multiUnordered}
            width={width}
          >
            <ChartAxis label={'Time'} tickCount={5} />
            <ChartAxis
              dependentAxis
              tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
              tickCount={4}
            />
            <ChartGroup>
              {chartData.map((value, index) => (
                
                <ChartArea
                  key={`chart-area-${index}`}
                  data={value.area}
                  interpolation="monotoneX"
                  // style={{
                  //   data: {
                  //     stroke: value.color
                  //   }
                  // }}
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
