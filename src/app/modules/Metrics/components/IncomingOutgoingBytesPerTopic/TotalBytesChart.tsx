import { TopicDataArray } from '@app/modules/Metrics/Metrics.api';
import {
  convertToSpecifiedByte,
  dateToChartValue,
  getLargestByteSize,
  shouldShowDate,
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
import React, { FunctionComponent } from 'react';
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

type TotalBytesChartProps = {
  incomingTopicsData: TopicDataArray;
  outgoingTopicsData: TopicDataArray;
  selectedTopic: string | undefined;
  timeDuration: number;
  itemsPerRow: number;
  width: number;
};
export const TotalBytesChart: FunctionComponent<TotalBytesChartProps> = ({
  incomingTopicsData,
  outgoingTopicsData,
  selectedTopic,
  timeDuration,
  itemsPerRow,
  width,
}) => {
  const { t } = useTranslation();

  const { chartData, legendData, largestByteSize } = getBytesChartData(
    incomingTopicsData,
    outgoingTopicsData,
    timeDuration,
    t('{{topic}} incoming bytes', { topic: selectedTopic || t('Total') }),
    t('{{topic}} outgoing bytes', { topic: selectedTopic || t('Total') })
  );

  return (
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
  );
};

export function getBytesChartData(
  incomingTopicArray: TopicDataArray,
  outgoingTopicArray: TopicDataArray,
  timeDuration: number,
  incomingTopicArrayName: string,
  outgoingTopicArrayName: string
) {
  const legendData: Array<LegendData> = [];
  const chartData: Array<ChartData> = [];
  const largestByteSize = getLargestByteSize(
    incomingTopicArray,
    outgoingTopicArray
  );

  // Aggregate of Incoming Bytes per Topic
  if (incomingTopicArray.length > 0) {
    const line: Array<TopicChartData> = [];
    const color = chart_color_blue_300.value;

    const getCurrentLengthOfData = () => {
      const timestampDiff =
        incomingTopicArray[incomingTopicArray.length - 1].timestamp -
        incomingTopicArray[0].timestamp;
      const minutes = timestampDiff / 1000 / 60;
      return minutes;
    };
    const lengthOfData = 6 * 60 - getCurrentLengthOfData();
    const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

    if (lengthOfData <= 360 && timeDuration >= 6) {
      for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
        const newTimestamp =
          incomingTopicArray[0].timestamp -
          (lengthOfDataPer5Mins - i) * (5 * 60000);
        const date = new Date(newTimestamp);
        const time = dateToChartValue(date, {
          showDate: shouldShowDate(timeDuration),
        });
        line.push({ name: incomingTopicArrayName, x: time, y: 0 });
      }
    }

    incomingTopicArray.map((value) => {
      const date = new Date(value.timestamp);
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      const aggregateBytes = value.bytes.reduce(function (a, b) {
        return a + b;
      }, 0);
      const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
      line.push({ name: incomingTopicArrayName, x: time, y: bytes });
    });

    chartData.push({ color, line });

    legendData.push({
      name: incomingTopicArrayName,
      symbol: {
        fill: chart_color_blue_300.value,
      },
    });
  }

  // Aggregate of Outgoing Bytes per Topic
  if (outgoingTopicArray.length > 0) {
    const line: Array<TopicChartData> = [];
    const color = chart_color_orange_300.value;

    const getCurrentLengthOfData = () => {
      const timestampDiff =
        outgoingTopicArray[outgoingTopicArray.length - 1].timestamp -
        outgoingTopicArray[0].timestamp;
      const minutes = timestampDiff / 1000 / 60;
      return minutes;
    };
    const lengthOfData = 6 * 60 - getCurrentLengthOfData();
    const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

    if (lengthOfData <= 360 && timeDuration >= 6) {
      for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
        const newTimestamp =
          outgoingTopicArray[0].timestamp -
          (lengthOfDataPer5Mins - i) * (5 * 60000);
        const date = new Date(newTimestamp);
        const time = dateToChartValue(date, {
          showDate: shouldShowDate(timeDuration),
        });
        line.push({ name: outgoingTopicArrayName, x: time, y: 0 });
      }
    }

    outgoingTopicArray.map((value) => {
      const date = new Date(value.timestamp);
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      const aggregateBytes = value.bytes.reduce(function (a, b) {
        return a + b;
      }, 0);
      const bytes = convertToSpecifiedByte(aggregateBytes, largestByteSize);
      line.push({ name: outgoingTopicArrayName, x: time, y: bytes });
    });
    chartData.push({ color, line });
    legendData.push({
      name: outgoingTopicArrayName,
      symbol: {
        fill: chart_color_orange_300.value,
      },
    });
  }
  return {
    legendData,
    chartData,
    largestByteSize,
  };
}
