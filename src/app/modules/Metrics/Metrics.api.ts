import {
  Configuration,
  ConfigurationParameters,
  DefaultApi,
} from '@rhoas/kafka-management-sdk';

export type TopicDataArray = { timestamp: number; bytes: number[] }[];

type FetchBytesDataProps = {
  kafkaID: string;
  timeDuration: number;
  timeInterval: number;
  selectedTopic: string | undefined;
} & Pick<ConfigurationParameters, 'accessToken' | 'basePath'>;

type FetchBytesDataReturnValue = {
  topicList: string[];
  outgoingTopics: TopicDataArray;
  incomingTopics: TopicDataArray;
};

export async function fetchBytesData({
  accessToken,
  basePath,
  kafkaID,
  timeDuration,
  timeInterval,
  selectedTopic,
}: FetchBytesDataProps): Promise<FetchBytesDataReturnValue> {
  const topicList = new Set<string>();
  const incomingTopics = new Map<number, number[]>();
  const outgoingTopics = new Map<number, number[]>();

  // try {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );

  const data = await apisService.getMetricsByRangeQuery(
    kafkaID,
    timeDuration * 60,
    timeInterval * 60,
    [
      'kafka_server_brokertopicmetrics_bytes_in_total',
      'kafka_server_brokertopicmetrics_bytes_out_total',
    ]
  );

  data.data.items?.forEach((item) => {
    const labels = item.metric;
    if (labels === undefined) {
      throw new Error('item.metric cannot be undefined');
    }
    if (item.values === undefined) {
      throw new Error('item.values cannot be undefined');
    }

    if (
      labels['topic'] !== '__strimzi_canary' &&
      labels['topic'] !== '__consumer_offsets' &&
      labels['topic']
    ) {
      topicList.add(labels['topic']);
    }

    const isSelectedItem =
      selectedTopic !== undefined
        ? labels['topic'] !== '__strimzi_canary' &&
          labels['topic'] !== '__consumer_offsets' &&
          selectedTopic === labels['topic']
        : labels['topic'] !== '__strimzi_canary' &&
          labels['topic'] !== '__consumer_offsets';

    if (isSelectedItem) {
      if (
        labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total'
      ) {
        item.values?.forEach((value) => {
          if (value.timestamp == undefined) {
            throw new Error('timestamp cannot be undefined');
          }
          if (incomingTopics.has(value.timestamp)) {
            incomingTopics.get(value.timestamp)?.push(value.value);
          } else {
            incomingTopics.set(value.timestamp, [value.value] as number[]);
          }
        });
      }
      if (
        labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_out_total'
      ) {
        item.values?.forEach((value) => {
          if (value.timestamp == undefined) {
            throw new Error('timestamp cannot be undefined');
          }
          if (outgoingTopics.has(value.timestamp)) {
            outgoingTopics.get(value.timestamp)?.push(value.value);
          } else {
            outgoingTopics.set(value.timestamp, [value.value] as number[]);
          }
        });
      }
    }
  });

  // } catch (error) {
  //   let reason: string | undefined;
  //   if (isServiceApiError(error)) {
  //     reason = error.response?.data.reason;
  //   }
  // }
  return {
    topicList: Array.from(topicList),
    incomingTopics: convertAndSortData(incomingTopics),
    outgoingTopics: convertAndSortData(outgoingTopics),
  };
}

function convertAndSortData(data: Map<number, number[]>): TopicDataArray {
  const convertedData = [] as TopicDataArray;
  data.forEach((value, key) =>
    convertedData.push({ timestamp: key, bytes: value })
  );
  convertedData.sort((a, b) => a.timestamp - b.timestamp);
  return [...convertedData];
}

export type Partition = {
  name: string;
  data: {
    timestamp: number;
    bytes: number;
    name: string;
  }[];
};

type FetchLogSizePerPartitionProps = {
  kafkaID: string;
  timeDuration: number;
  timeInterval: number;
  selectedTopic: string;
} & Pick<ConfigurationParameters, 'accessToken' | 'basePath'>;

type FetchLogSizePerPartitionReturnValue = Partition[];

export async function fetchLogSizePerPartition({
  accessToken,
  basePath,
  kafkaID,
  timeDuration,
  timeInterval,
  selectedTopic,
}: FetchLogSizePerPartitionProps): Promise<FetchLogSizePerPartitionReturnValue> {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  const data = await apisService.getMetricsByRangeQuery(
    kafkaID,
    timeDuration * 60,
    timeInterval * 60,
    ['kafka_log_log_size']
  );

  const partitionArray: Partition[] = [];

  data.data.items?.forEach((item, i) => {
    const topicName = item?.metric?.topic;
    const labels = item.metric;
    if (labels === undefined) {
      throw new Error('item.metric cannot be undefined');
    }
    if (item.values === undefined) {
      throw new Error('item.values cannot be undefined');
    }

    const topic = {
      name: topicName,
      data: [],
    } as Partition;

    const isTopicInArray = partitionArray.some(
      (topic) => topic.name === topicName
    );

    if (labels['__name__'] === 'kafka_topic:kafka_log_log_size:sum') {
      item.values?.forEach((value) => {
        if (value.timestamp == undefined) {
          throw new Error('timestamp cannot be undefined');
        }

        if (isTopicInArray) {
          partitionArray.forEach((topic: Partition) => {
            if (topic.name === topicName) {
              topic.data.forEach(
                (datum) => (datum.bytes = datum.bytes + value.value)
              );
            }
          });
        } else {
          topic.data.push({
            name: topicName || '',
            timestamp: value.timestamp,
            bytes: value.value,
          });
        }
      });
    }

    if (!isTopicInArray) {
      partitionArray.push(topic);
    }
  });
  return partitionArray.filter(
    (topic) =>
      topic.name !== '__strimzi_canary' && topic.name !== '__consumer_offsets'
  );
}
