import { Partition } from "@app/modules/Metrics/Metrics.api";
import {
  convertToSpecifiedByte,
  dateToChartValue,
  getLargestByteSize,
  shouldShowDate,
} from "@app/modules/Metrics/utils";
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
  ChartVoronoiContainer,
} from "@patternfly/react-charts";
import chart_color_blue_300 from "@patternfly/react-tokens/dist/js/chart_color_blue_300";
import chart_color_green_300 from "@patternfly/react-tokens/dist/js/chart_color_green_300";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

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
  partitions: Partition[];
  timeDuration: number;
  itemsPerRow: number;
  width: number;
};
export const LogSizePerPartitionChart: FunctionComponent<LogSizePerPartitionChartProps> =
  ({ partitions, timeDuration, itemsPerRow, width }) => {
    const { t } = useTranslation();

    const { chartData, largestByteSize, legendData } =
      getLogSizePerPartitionChartData(partitions, timeDuration);

    return (
      <Chart
        ariaTitle={t("metrics.log_size_per_partition")}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.y}`}
            constrainToVisibleArea
          />
        }
        legendPosition="bottom-left"
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
        <ChartAxis label={"\n" + "Time"} tickCount={6} />
        <ChartAxis
          dependentAxis
          tickFormat={(t) => `${Math.round(t)} ${largestByteSize}`}
        />
        <ChartGroup>
          {chartData.map((value, index) => (
            <ChartArea
              key={`chart-area-${index}`}
              data={value.area}
              interpolation="monotoneX"
            />
          ))}
        </ChartGroup>
      </Chart>
    );
  };

export function getLogSizePerPartitionChartData(
  partitionArray: Partition[],
  timeDuration: number
) {
  const legendData: Array<LegendData> = [];
  const chartData: Array<ChartData> = [];
  const largestByteSize = getLargestByteSize(partitionArray, undefined);
  partitionArray.map((partition, index) => {
    const color = colors[index];
    legendData.push({
      name: partition.name,
    });
    const area: Array<PartitionChartData> = [];

    const getCurrentLengthOfData = () => {
      const timestampDiff =
        partition.data[partition.data.length - 1].timestamp -
        partition.data[0].timestamp;
      const minutes = timestampDiff / 1000 / 60;
      return minutes;
    };
    const lengthOfData = 6 * 60 - getCurrentLengthOfData();
    const lengthOfDataPer5Mins = (6 * 60 - getCurrentLengthOfData()) / 5;

    if (lengthOfData <= 360 && timeDuration >= 6) {
      for (let i = 0; i < lengthOfDataPer5Mins; i = i + 1) {
        const newtimestamp =
          partition.data[0].timestamp -
          (lengthOfDataPer5Mins - i) * (5 * 60000);
        const date = new Date(newtimestamp);
        const time = dateToChartValue(date, {
          showDate: shouldShowDate(timeDuration),
        });
        area.push({ name: partition.name, x: time, y: 0 });
      }
    }

    partition.data.map((value) => {
      const date = new Date(value.timestamp);
      const time = dateToChartValue(date, {
        showDate: shouldShowDate(timeDuration),
      });
      const bytes = convertToSpecifiedByte(value.bytes, largestByteSize);
      area.push({ name: value.name, x: time, y: bytes });
    });
    chartData.push({ color, area });
  });
  return {
    legendData,
    chartData,
    largestByteSize,
  };
}
