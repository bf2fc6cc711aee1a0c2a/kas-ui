import byteSize from 'byte-size';

export const getLargestByteSize = (data) => {
  let currentByteSize = "B";
  data.map(datum => {
    datum.data.forEach(value => {
      const byteString = byteSize(value.bytes).unit;
      if(byteString === "kB") {
        if (currentByteSize === "B") {
          currentByteSize = "kB";
        }
      }
      if(byteString === "MB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB') {
          currentByteSize = "MB";
        }
      }
      if(byteString === "GB") {
        if (currentByteSize === 'B' || currentByteSize === 'kB' || currentByteSize === 'MB') {
          currentByteSize = "GB";
        }
      }
    })
  })
  return currentByteSize;
}

export const convertToSpecifiedByte = (bytes, largestByteSize) => {
  if(largestByteSize === 'B') {
    return Math.round(bytes * 10) / 10
  }
  if(largestByteSize === 'kB') {
    return Math.round(bytes / 1024 * 10) / 10
  }
  if(largestByteSize === 'MB') {
    return Math.round(bytes / 1024 / 1024 * 10) / 10
  }
  if(largestByteSize === 'GB') {
    return Math.round(bytes / 1024 / 1024 / 1024 * 10) / 10
  }
}

export const getMaxValueOfArray = (data) => {
  const max = data.reduce(function(prev, current) {
    return (prev.bytes > current.bytes) ? prev : current
  })
  return max.bytes;
}


// const convertTopicLabels = (topic) => {
//   if(topic === '__strimzi_canary') {
//     return 'Strimzi canary'
//   }
//   if(topic === '__consumer_offsets') {
//     return 'Consumer offsets'
//   }
//   else {
//     return topic
//   }
// }