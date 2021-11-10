import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import { useTranslation } from 'react-i18next';
import {
  convertToSpecifiedByte,
  dateToChartValue,
  getLargestByteSize,
  shouldShowDate,
} from '../../utils';
import { TopicDataArray } from './fetchBytesData';

export type ChartData = {
  color: string;
  line: TopicChartData[];
};

export type TopicChartData = {
  name: string;
  x: string;
  y: number;
};

export type LegendData = {
  name: string;
  symbol: {
    fill: string;
    type?: string;
  };
};

export function useBytesDataChart() {
  const { t } = useTranslation();
  const incomingTopicArrayName = t('Total incoming bytes'); // name: "Total incoming bytes",
  const outgoingTopicArrayName = t('Total outgoing bytes'); // name: "Total outgoing bytes",

  function getChartData(
    incomingTopicArray: TopicDataArray,
    outgoingTopicArray: TopicDataArray,
    timeDuration: number
  ) {
    return getChartProps(
      incomingTopicArray,
      outgoingTopicArray,
      timeDuration,
      incomingTopicArrayName,
      outgoingTopicArrayName
    );
  }

  return {
    getChartData,
  };
}

function getChartProps(
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
