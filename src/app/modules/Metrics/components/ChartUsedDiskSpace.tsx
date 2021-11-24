import {
  convertToSpecifiedByte,
  dateToChartValue,
  shouldShowDate,
} from '@app/modules/Metrics/utils';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_black_500 from '@patternfly/react-tokens/dist/js/chart_color_black_500';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TotalBytesMetrics } from '..';
import { DurationOptions } from './FilterByTime';

type ChartData = {
  areaColor: string;
  softLimitColor: string;
  area: BrokerChartData[];
  softLimit: BrokerChartData[];
};

type BrokerChartData = {
  name: string;
  x: string;
  y: number;
};

type LegendData = {
  name: string;
  symbol?: {
    fill?: string;
    type?: string;
  };
};

type ChartUsedDiskSpaceProps = {
  metrics: TotalBytesMetrics;
  timeDuration: DurationOptions;
};

export const ChartUsedDiskSpace: FunctionComponent<ChartUsedDiskSpaceProps> = ({
  metrics,
  timeDuration,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [width, setWidth] = useState<number>();
  const usageLimit = 1000; // Replace with limit from API

  const handleResize = () =>
    containerRef.current && setWidth(containerRef.current.clientWidth);
  const itemsPerRow = width && width > 650 ? 6 : 3;

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, [width]);

  const { chartData, legendData, largestByteSize } = getChartData(
    metrics,
    timeDuration,
    usageLimit,
    t('Used disk space'),
    t('Limit')
  );

  return (
    <div ref={containerRef}>
      <Chart
        ariaTitle={t('metrics.used_disk_space')}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendPosition='bottom-left'
        legendComponent={
          <ChartLegend
            orientation={'horizontal'}
            data={legendData}
            itemsPerRow={itemsPerRow}
          />
        }
        height={350}
        padding={{
          bottom: 110, // Adjusted to accomodate legend
          left: 90,
          right: 60,
          top: 25,
        }}
        themeColor={ChartThemeColor.multiUnordered}
        width={width}
        minDomain={{ y: 0 }}
        legendAllowWrap={true}
      >
        <ChartAxis label={'\n' + 'Time'} tickCount={6} />
        <ChartAxis
          label={'\n\n\n' + 'Used disk space'}
          dependentAxis
          tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
          tickCount={4}
        />
        <ChartGroup>
          {chartData.map((value, index) => (
            <ChartArea
              key={`chart-area-${index}`}
              data={value.area}
              interpolation='monotoneX'
              style={{
                data: {
                  // TODO: check if this is needed
                  // stroke: value.color,
                },
              }}
            />
          ))}
        </ChartGroup>
        <ChartThreshold
          key={`chart-softlimit`}
          data={chartData[0].softLimit}
          style={{
            data: {
              stroke: chartData[0].softLimitColor,
            },
          }}
        />
      </Chart>
    </div>
  );
};

const getChartData = (
  metrics: TotalBytesMetrics,
  timeDuration: number,
  usageLimit: number,
  lineLabel: string,
  limitLabel: string
) => {
  const legendData: Array<LegendData> = [
    {
      name: limitLabel,
      symbol: { fill: chart_color_black_500.value, type: 'threshold' },
    },
    { name: lineLabel, symbol: { fill: chart_color_blue_300.value } },
  ];

  const areaColor = chart_color_blue_300.value;
  const softLimitColor = chart_color_black_500.value;
  const chartData: Array<ChartData> = [];
  const area: Array<BrokerChartData> = [];
  const softLimit: Array<BrokerChartData> = [];
  const largestByteSize = 'GiB'; // Hard code GiB as the largest byte size because there will always be a 20 GiB limit.

  const timestamps = Object.keys(metrics).map((ts) => parseInt(ts, 10));
  const currentLengthOfData = (() => {
    const timestampDiff = timestamps[timestamps.length - 1] - timestamps[0];
    const minutes = timestampDiff / 1000 / 60;
    return minutes;
  })();
  const lengthOfData = 6 * 60 - currentLengthOfData;
  const lengthOfDataPer5Mins = (6 * 60 - currentLengthOfData) / 5;

  if (lengthOfData <= 360 && timeDuration >= 6) {
    for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
      const newTimestamp =
        timestamps[0] - (lengthOfDataPer5Mins - i) * (5 * 60000);
      const date = new Date(newTimestamp);
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      area.push({ name: lineLabel, x: time, y: 0 });
      softLimit.push({ name: limitLabel, x: time, y: usageLimit });
    }
  }

  Object.entries(metrics).map(([timestamp, bytes]) => {
    const date = new Date(parseInt(timestamp));
    const time = dateToChartValue(date, {
      showDate: shouldShowDate(timeDuration),
    });

    const convertedBytes = convertToSpecifiedByte(bytes, largestByteSize);
    area.push({ name: lineLabel, x: time, y: convertedBytes });
    softLimit.push({ name: limitLabel, x: time, y: usageLimit });
  });
  chartData.push({ areaColor, softLimitColor, area, softLimit });

  return {
    legendData,
    chartData,
    largestByteSize,
  };
};
