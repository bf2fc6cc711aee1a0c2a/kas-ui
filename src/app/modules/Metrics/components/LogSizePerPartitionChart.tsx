import { PartitionBytesMetric } from '@app/modules/Metrics/MetricsApi';
import {
  convertToSpecifiedByte,
  dateToChartValue,
  getLargestByteSize,
  shouldShowDate,
} from '@app/modules/Metrics/utils';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const colors = [chart_color_green_300.value, chart_color_blue_300.value];

type ChartData = {
  color: string;
  area: PartitionChartData[];
};

type PartitionChartData = {
  name: string;
  x: string;
  y: number;
};

type LegendData = {
  name: string;
};

export type LogSizePerPartitionChartProps = {
  partitions: PartitionBytesMetric;
  timeDuration: number;
};
export const LogSizePerPartitionChart: FunctionComponent<LogSizePerPartitionChartProps> =
  ({ partitions, timeDuration }) => {
    const { t } = useTranslation();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number>();

    const handleResize = () =>
      containerRef.current && setWidth(containerRef.current.clientWidth);
    const itemsPerRow = width && width > 650 ? 6 : 3;

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    }, [width]);

    const { chartData, largestByteSize, legendData } =
      getLogSizePerPartitionChartData(partitions, timeDuration);

    return (
      <div ref={containerRef}>
        <Chart
          ariaTitle={t('metrics.log_size_per_partition')}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.name}: ${datum.y}`}
              constrainToVisibleArea
            />
          }
          legendPosition='bottom-left'
          legendComponent={
            <ChartLegend data={legendData} itemsPerRow={itemsPerRow} />
          }
          height={350}
          padding={{
            bottom: 110,
            left: 90,
            right: 30,
            top: 25,
          }}
          themeColor={ChartThemeColor.multiUnordered}
          width={width}
          legendAllowWrap={true}
        >
          <ChartAxis label={'\n' + 'Time'} tickCount={6} />
          <ChartAxis
            dependentAxis
            tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
          />
          <ChartGroup>
            {chartData.map((value, index) => (
              <ChartArea
                key={`chart-area-${index}`}
                data={value.area}
                interpolation='monotoneX'
              />
            ))}
          </ChartGroup>
        </Chart>
      </div>
    );
  };

export function getLogSizePerPartitionChartData(
  partitions: PartitionBytesMetric,
  timeDuration: number
) {
  const legendData: Array<LegendData> = [];
  const chartData: Array<ChartData> = [];
  const largestByteSize = getLargestByteSize(partitions, undefined);
  Object.entries(partitions).map(([name, dataMap], index) => {
    const timestamps = Object.keys(dataMap).map((s) => parseInt(s, 10));
    const color = colors[index];
    legendData.push({
      name,
    });
    const area: Array<PartitionChartData> = [];

    const getCurrentLengthOfData = () => {
      const timestampDiff = timestamps[timestamps.length - 1] - timestamps[0];
      const minutes = timestampDiff / 1000 / 60;
      return minutes;
    };
    const lengthOfData = 6 * 60 - getCurrentLengthOfData();
    const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

    if (lengthOfData <= 360 && timeDuration >= 6) {
      for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
        const newtimestamp =
          timestamps[0] - (lengthOfDataPer5Mins - i) * (5 * 60000);
        const date = new Date(newtimestamp);
        const time = dateToChartValue(date, {
          showDate: shouldShowDate(timeDuration),
        });
        area.push({ name, x: time, y: 0 });
      }
    }

    Object.entries(dataMap).map(([timestamp, value]) => {
      const date = new Date(parseInt(timestamp, 10));
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      const bytes = convertToSpecifiedByte(value, largestByteSize);
      area.push({ name, x: time, y: bytes });
    });
    chartData.push({ color, area });
  });
  return {
    legendData,
    chartData,
    largestByteSize,
  };
}
