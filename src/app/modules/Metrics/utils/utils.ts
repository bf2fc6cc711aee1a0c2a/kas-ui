import byteSize from 'byte-size';

export const getLargestByteSize = (data1, data2) => {
  let currentByteSize = 'B';
  data1.data.map((datum) => {
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
        if (currentByteSize === 'B' || currentByteSize === 'kiB' || currentByteSize === 'MiB') {
          currentByteSize = 'GiB';
        }
      }
    });
  });
  data2.data.map((datum) => {
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
        if (currentByteSize === 'B' || currentByteSize === 'kiB' || currentByteSize === 'MiB') {
          currentByteSize = 'GiB';
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
  if (largestByteSize === 'kiB') {
    return Math.round((bytes / 1024) * 10) / 10;
  }
  if (largestByteSize === 'MiB') {
    return Math.round((bytes / 1024 / 1024) * 10) / 10;
  }
  if (largestByteSize === 'GiB') {
    return Math.round((bytes / 1024 / 1024 / 1024) * 10) / 10;
  }
};

export const getMaxValueOfArray = (data) => {
  const max = data.reduce(function (prev, current) {
    return prev.bytes > current.bytes ? prev : current;
  });
  return max.bytes;
};
