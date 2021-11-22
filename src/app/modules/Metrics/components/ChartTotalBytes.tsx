import { TotalBytesMetrics } from '@app/modules/Metrics/MetricsApi';
import {
  convertToSpecifiedByte,
  dateToChartValue,
  getLargestByteSize,
  shouldShowDate,
  SupportedSizes,
} from '@app/modules/Metrics/utils';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ChartData = {
  color: string;
  line: TopicChartData[];
};

type TopicChartData = {
  name: string;
  x: string;
  y: number;
};

type LegendData = {
  name: string;
  symbol: {
    fill: string;
    type?: string;
  };
};

type ChartTotalBytesProps = {
  incomingTopicsData: TotalBytesMetrics;
  outgoingTopicsData: TotalBytesMetrics;
  selectedTopic: string | undefined;
  timeDuration: number;
};
export const ChartTotalBytes: FunctionComponent<ChartTotalBytesProps> = ({
  incomingTopicsData,
  outgoingTopicsData,
  selectedTopic,
  timeDuration,
}) => {
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

  const { chartData, legendData, largestByteSize } = getBytesChartData(
    incomingTopicsData,
    outgoingTopicsData,
    timeDuration,
    t('{{topic}} incoming bytes', { topic: selectedTopic || t('Total') }),
    t('{{topic}} outgoing bytes', { topic: selectedTopic || t('Total') })
  );

  return (
    <div ref={containerRef}>
      <Chart
        ariaTitle={t('metrics.total_bytes')}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendAllowWrap={true}
        legendPosition='bottom-left'
        legendComponent={
          <ChartLegend data={legendData} itemsPerRow={itemsPerRow} />
        }
        height={300}
        padding={{
          bottom: 110,
          left: 90,
          right: 30,
          top: 25,
        }}
        themeColor={ChartThemeColor.multiUnordered}
        width={width}
      >
        <ChartAxis label={'\n' + 'Time'} tickCount={6} />
        <ChartAxis
          dependentAxis
          tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
          tickCount={4}
          minDomain={{ y: 0 }}
        />
        <ChartGroup>
          {chartData.map((value, index) => (
            <ChartLine
              key={`chart-line-${index}`}
              data={value.line}
              style={{
                data: {
                  stroke: value.color,
                },
              }}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export function getBytesChartData(
  incomingTopic: TotalBytesMetrics,
  outgoingTopic: TotalBytesMetrics,
  timeDuration: number,
  incomingTopicName: string,
  outgoingTopicName: string
) {
  const legendData: Array<LegendData> = [];
  const chartData: Array<ChartData> = [];
  const largestByteSize = getLargestByteSize(incomingTopic, outgoingTopic);

  const incomingLine = metricsToLine(
    incomingTopic,
    timeDuration,
    incomingTopicName,
    largestByteSize
  );
  if (incomingLine) {
    const color = chart_color_blue_300.value;
    chartData.push({ color, line: incomingLine });
    legendData.push({
      name: incomingTopicName,
      symbol: {
        fill: color,
      },
    });
  }

  const outgoingLine = metricsToLine(
    outgoingTopic,
    timeDuration,
    outgoingTopicName,
    largestByteSize
  );
  if (outgoingLine) {
    const color = chart_color_orange_300.value;
    chartData.push({ color, line: outgoingLine });
    legendData.push({
      name: outgoingTopicName,
      symbol: {
        fill: color,
      },
    });
  }
  return {
    legendData,
    chartData,
    largestByteSize,
  };
}

function metricsToLine(
  metrics: TotalBytesMetrics,
  timeDuration: number,
  name: string,
  largestByteSize: SupportedSizes
) {
  const timestamps = Object.keys(metrics).map((ts) => parseInt(ts, 10));
  if (timestamps.length > 0) {
    const line: Array<TopicChartData> = [];

    Object.entries(metrics).map(([timestamp, bytes]) => {
      const date = new Date(parseInt(timestamp, 10));
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      const convertedBytes = convertToSpecifiedByte(bytes, largestByteSize);
      line.push({ name, x: time, y: convertedBytes });
    });
    return line;
  }
  return undefined;
}
