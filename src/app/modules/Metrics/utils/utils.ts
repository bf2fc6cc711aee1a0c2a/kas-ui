import byteSize from 'byte-size';

export type SupportedSizes = 'B' | 'kiB' | 'MiB' | 'GiB';

export const getLargestByteSize = (data1, data2): SupportedSizes => {
  let currentByteSize: SupportedSizes = 'B';

  data1 = data1 && (data1.sortedData ? data1.sortedData : data1.data);
  data2 = data2 && (data2.sortedData ? data2.sortedData : data2.data);

  data1 &&
    data1.map((datum) => {
      datum.bytes.forEach((value) => {
        const byteString = byteSize(value).unit;
        if (byteString === 'kiB') {
          if (currentByteSize === 'B') {
            currentByteSize = 'kiB';
          }
        }
        if (byteString === 'MiB') {
          if (currentByteSize === 'B' || currentByteSize === 'kiB') {
            currentByteSize = 'MiB';
          }
        }
        if (byteString === 'GiB') {
          if (
            currentByteSize === 'B' ||
            currentByteSize === 'kiB' ||
            currentByteSize === 'MiB'
          ) {
            currentByteSize = 'GiB';
          }
        }
      });
    });

  data2 &&
    data2.map((datum) => {
      datum.bytes.forEach((value) => {
        const byteString = byteSize(value).unit;
        if (byteString === 'kiB') {
          if (currentByteSize === 'B') {
            currentByteSize = 'kiB';
          }
        }
        if (byteString === 'MiB') {
          if (currentByteSize === 'B' || currentByteSize === 'kiB') {
            currentByteSize = 'MiB';
          }
        }
        if (byteString === 'GiB') {
          if (
            currentByteSize === 'B' ||
            currentByteSize === 'kiB' ||
            currentByteSize === 'MiB'
          ) {
            currentByteSize = 'GiB';
          }
        }
      });
    });

  return currentByteSize;
};

export const convertToSpecifiedByte = (
  bytes: number,
  largestByteSize: SupportedSizes
): number => {
  if (largestByteSize === 'B') {
    return Math.round(bytes * 10) / 10;
  }
  if (largestByteSize === 'kiB') {
    return Math.round((bytes / 1024) * 10) / 10;
  }
  if (largestByteSize === 'MiB') {
    return Math.round((bytes / 1024 / 1024) * 10) / 10;
  }
  if (largestByteSize === 'GiB') {
    return Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10;
  }
  return bytes;
};

export const shouldShowDate = (timeDuration) => {
  return timeDuration >= 24 * 60 ? true : false;
};

export const dateToChartValue = (date, { showDate }) => {
  const [dateValue, timeValue] = date.toISOString().split('T');
  return showDate
    ? timeValue.slice(0, 5) + '\n' + dateValue
    : timeValue.slice(0, 5);
};
export const getMaxValueOfArray = (data) => {
  const max = data.reduce(function (prev, current) {
    return prev.bytes > current.bytes ? prev : current;
  });
  return max.bytes;
};

//Add a scalable logic to set duration and interval
export const formatTime = (selection: string) => {
  let timeDuration = 6;
  let timeInterval = 1 * 60; //in minutes
  switch (selection) {
    case 'Last 5 minutes':
      timeDuration = 5 / 60;
      timeInterval = 1;
      break;
    case 'Last 15 minutes':
      timeDuration = 15 / 60;
      timeInterval = 3;
      break;
    case 'Last 30 minutes':
      timeDuration = 30 / 60;
      timeInterval = 5;
      break;
    case 'Last 1 hour':
      timeDuration = 1;
      timeInterval = 10;
      break;
    case 'Last 3 hours':
      timeDuration = 3;
      timeInterval = 30;
      break;
    case 'Last 6 hours':
      timeDuration = 6;
      timeInterval = 1 * 60;
      break;
    case 'Last 12 hours':
      timeDuration = 12;
      timeInterval = 2 * 60;
      break;
    case 'Last 24 hours':
      timeDuration = 24;
      timeInterval = 4 * 60;
      break;
    case 'Last 2 days':
      timeDuration = 2 * 24;
      timeInterval = 8 * 60;
      break;
    case 'Last 7 days':
      timeDuration = 7 * 24;
      timeInterval = 24 * 60;
      break;
  }
  return { timeDuration, timeInterval };
};

export const timeIntervalsMapping = {
  5: 1 * 60, // Last 5 minutes: 5 ticks / 1 minute
  15: 3 * 60, // Last 15 minutes: 5 ticks / 3 minutes
  30: 5 * 60, // Last 30 minutes: 6 ticks / 5 minutes
  60: 10 * 60, // Last 1 hour: 6 ticks / 10 minutes
  [3 * 60]: 30 * 60, // Last 3 hours: 6 ticks / 30 minutes
  [6 * 60]: 1 * 60 * 60, // Last 6 hours: 6 ticks / 1 hour
  [12 * 60]: 2 * 60 * 60, // Last 12 hours: 6 ticks / 2 hours
  [24 * 60]: 4 * 60 * 60, // Last 24 hours: 6 ticks / 4 hours - date & time should display
  [2 * 24 * 60]: 8 * 60 * 60, // Last 2 days: 6 ticks / 8 hours - date & time should display
  [7 * 24 * 60]: 24 * 60 * 60, // Last 7 days: 7 ticks / 1 day - date & time should display
};
