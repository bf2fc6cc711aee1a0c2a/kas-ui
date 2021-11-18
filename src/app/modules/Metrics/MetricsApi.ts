import { TopicsApi } from "@rhoas/kafka-instance-sdk";
import {
  Configuration,
  ConfigurationParameters,
  DefaultApi,
  RangeQuery,
} from "@rhoas/kafka-management-sdk";

export type BasicApiConfigurationParameters = Pick<
  ConfigurationParameters,
  "accessToken" | "basePath"
>;

type FetchMetricsAndTopicsProps = FetchMetricsProps;

export const fetchMetricsAndTopics = async (
  props: FetchMetricsAndTopicsProps
) => {
  const [kafkaTopics, metrics] = await Promise.all([
    fetchKafkaTopis(props),
    fetchMetrics(props),
  ]);
  const {
    topics: metricsTopics,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
  } = metrics;
  return {
    kafkaTopics,
    metricsTopics,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
  };
};

export const fetchKafkaTopis = async ({
  accessToken,
  basePath,
}: BasicApiConfigurationParameters): Promise<string[]> => {
  const api = new TopicsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  const response = await api.getTopics(
    undefined,
    100,
    100,
    undefined,
    undefined,
    undefined,
    undefined
  );
  return (response.data.items || []).map((t) => t.name as string);
};

export type TotalBytesMetrics = { [timestamp: string]: number };
export type PartitionBytesMetric = { [partition: string]: TotalBytesMetrics };
type FetchMetricsProps = {
  kafkaId: string;
  timeDuration: number;
  timeInterval: number;
  selectedTopic: string | undefined;
} & BasicApiConfigurationParameters;
type FetchMetricsReturnValue = {
  topics: string[];
  bytesOutgoing: TotalBytesMetrics;
  bytesIncoming: TotalBytesMetrics;
  bytesPerPartition: PartitionBytesMetric;
};
export async function fetchMetrics({
  accessToken,
  basePath,
  kafkaId,
  timeDuration,
  timeInterval,
  selectedTopic,
}: FetchMetricsProps): Promise<FetchMetricsReturnValue> {
  const privateTopics = ["__consumer_offsets", "__strimzi_canary"];

  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );

  const response = await apisService.getMetricsByRangeQuery(
    kafkaId,
    timeDuration,
    timeInterval,
    [
      "kafka_server_brokertopicmetrics_bytes_in_total",
      "kafka_server_brokertopicmetrics_bytes_out_total",
      "kafka_topic:kafka_log_log_size:sum",
    ]
  );

  type NoUndefinedField<T> = {
    [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
  };
  type SafeRangeQuery = NoUndefinedField<RangeQuery>;

  // Remove all results with no data. Not sure this can really  happen but since
  // the types allow for undefined we need to do a bit of defensive programming.
  const safeMetrics: SafeRangeQuery[] = (response.data.items || []).filter(
    (m) =>
      // defensive programming
      !(m.values && m.metric && m.metric.topic && m.metric.name) &&
      !privateTopics.includes(m.metric?.topic || "")
  ) as SafeRangeQuery[];

  // Also filter for metrics about the selectedTopic, if specified
  const filteredMetrics = safeMetrics.filter((m) =>
    // filter for metrics for the selectedTopic, if needed
    selectedTopic !== undefined ? m.metric?.topic === selectedTopic : true
  );

  // get the unique topics we have metrics for in the selected time range
  const topics = Array.from(new Set(safeMetrics.map((m) => m.metric.topic)));

  const bytesIncoming: TotalBytesMetrics = {};
  const bytesOutgoing: TotalBytesMetrics = {};
  const bytesPerPartition: PartitionBytesMetric = {};

  filteredMetrics.forEach((m) => {
    const { __name__: name, topic } = m.metric;

    function addAggregatedTotalBytesTo(metric: TotalBytesMetrics) {
      m.values.forEach(
        ({ value, timestamp }) =>
          (metric[timestamp] = value + (metric[timestamp] || 0))
      );
    }

    function addAggregatePartitionBytes() {
      const partition = bytesPerPartition[topic] || {};
      m.values.forEach(
        ({ value, timestamp }) =>
          (partition[timestamp] = value + (partition[timestamp] || 0))
      );
      bytesPerPartition[topic] = partition;
    }

    switch (name) {
      case "kafka_server_brokertopicmetrics_bytes_in_total":
        addAggregatedTotalBytesTo(bytesIncoming);
        break;
      case "kafka_server_brokertopicmetrics_bytes_out_total":
        addAggregatedTotalBytesTo(bytesOutgoing);
        break;
      case "kafka_topic:kafka_log_log_size:sum":
        addAggregatePartitionBytes();
        break;
    }
  });

  return {
    topics,
    bytesOutgoing,
    bytesIncoming,
    bytesPerPartition,
  };
}