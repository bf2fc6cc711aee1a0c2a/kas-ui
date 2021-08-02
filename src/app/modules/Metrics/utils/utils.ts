import byteSize from 'byte-size';

export const getLargestByteSize = (data1, data2) => {
  let currentByteSize = 'B';
  data1.data.map((datum) => {
    datum.bytes.forEach((value) => {
      const byteString = byteSize(value).unit;
      if (byteString === 'kB') {
        if (currentByteSize === 'B') {
          currentByteSize = 'kB';
        }
      }
      if (byteString === 'MB') {
        if (currentByteSize === 'B' || currentByteSize === 'kB') {
          currentByteSize = 'MB';
        }
      }
      if (byteString === 'GB') {
        if (currentByteSize === 'B' || currentByteSize === 'kB' || currentByteSize === 'MB') {
          currentByteSize = 'GB';
        }
      }
    });
  });
  data2.data.map((datum) => {
    datum.bytes.forEach((value) => {
      const byteString = byteSize(value).unit;
      if (byteString === 'kB') {
        if (currentByteSize === 'B') {
          currentByteSize = 'kB';
        }
      }
      if (byteString === 'MB') {
        if (currentByteSize === 'B' || currentByteSize === 'kB') {
          currentByteSize = 'MB';
        }
      }
      if (byteString === 'GB') {
        if (currentByteSize === 'B' || currentByteSize === 'kB' || currentByteSize === 'MB') {
          currentByteSize = 'GB';
        }
      }
    });
  });
  return currentByteSize;
};

export const convertToSpecifiedByte = (bytes, largestByteSize) => {
  if (largestByteSize === 'B') {
    return Math.round(bytes * 10) / 10;
  }
  if (largestByteSize === 'kB') {
    return Math.round((bytes / 1024) * 10) / 10;
  }
  if (largestByteSize === 'MB') {
    return Math.round((bytes / 1024 / 1024) * 10) / 10;
  }
  if (largestByteSize === 'GB') {
    return Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10;
  }
};

export const getMaxValueOfArray = (data) => {
  const max = data.reduce(function (prev, current) {
    return prev.bytes > current.bytes ? prev : current;
  });
  return max.bytes;
};
