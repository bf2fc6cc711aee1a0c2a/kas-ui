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
  return (response.data.items || []).map((t) => t.name!);
};

export type TotalBytesMetrics = Map<string, number>;
export type PartitionBytesMetric = Map<string, TotalBytesMetrics>;
type FetchMetricsProps = {
  kafkaID: string;
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
  kafkaID,
  timeDuration,
  timeInterval,
  selectedTopic,
}: FetchMetricsProps): Promise<FetchMetricsReturnValue> {
  const apisService = new DefaultApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );

  const response = await apisService.getMetricsByRangeQuery(
    kafkaID,
    timeDuration * 60,
    timeInterval * 60,
    [
      "kafka_server_brokertopicmetrics_bytes_in_total",
      "kafka_server_brokertopicmetrics_bytes_out_total",
      "kafka_log_log_size",
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
      !(m.values && m.metric && m.metric.topic && m.metric.name)
  ) as SafeRangeQuery[];

  // Also filter for metrics about the selectedTopic, if specified
  const filteredMetrics = safeMetrics.filter((m) =>
    // filter for metrics for the selectedTopic, if needed
    selectedTopic !== undefined ? m.metric?.topic === selectedTopic : true
  );

  // get the unique topics we have metrics for in the selected time range
  const topics = Array.from(new Set(safeMetrics.map((m) => m.metric!.topic!)));

  const bytesIncoming: TotalBytesMetrics = new Map<string, number>();
  const bytesOutgoing: TotalBytesMetrics = new Map<string, number>();
  const bytesPerPartition: PartitionBytesMetric = new Map<
    string,
    Map<string, number>
  >();

  filteredMetrics.forEach((m) => {
    const { name, topic, timestamp } = m.metric;

    function addAggregatedTotalBytesTo(metric: TotalBytesMetrics) {
      const aggregatedBytes = m.values.reduce((total, v) => v.value + total, 0);
      const bytesForTimestamp = metric.get(timestamp) || 0;
      metric.set(timestamp, bytesForTimestamp + aggregatedBytes);
    }

    function addAggregatePartitionBytes() {
      const aggregatedBytes = m.values.reduce((total, v) => v.value + total, 0);
      const partition =
        bytesPerPartition.get(topic) || new Map<string, number>();
      const bytesForTimestamp = partition.get(timestamp) || 0;
      partition.set(timestamp, bytesForTimestamp + aggregatedBytes);
      bytesPerPartition.set(topic, partition);
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
