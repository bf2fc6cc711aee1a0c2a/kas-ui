import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, GridItem, PageSection } from "@patternfly/react-core";
import {
  UsedDiskSpaceChart,
  IncomingOutgoingBytesPerTopic,
} from "@app/modules/Metrics/components";
import { ChartEmptyState } from "./components/ChartEmptyState";
import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { useTopics } from "./topicMetricsMachine";

export interface MetricsProps {
  kafkaId: string;
  onCreateTopic: () => void;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  const { t } = useTranslation();

  const {
    isLoading,
    isDataUnavailable,
    isFailed,
    selectedTopic,
    timeDuration,
    topics,
    bytesIncoming,
    bytesOutgoing,
    bytesPerPartition,
    onDurationChange,
    onTopicChange,
    onRefresh,
  } = useTopics(kafkaId);

  return (
    <PageSection>
      {!isFailed ? (
        <Grid hasGutter>
          <GridItem>
            <UsedDiskSpaceChart
              kafkaID={kafkaId}
              metricsDataUnavailable={isDataUnavailable}
              setMetricsDataUnavailable={() => false}
            />
          </GridItem>
          <GridItem>
            <IncomingOutgoingBytesPerTopic
              metricsDataUnavailable={false}
              onCreateTopic={onCreateTopic}
              topics={topics}
              incomingTopicsData={bytesIncoming}
              outgoingTopicsData={bytesOutgoing}
              partitions={bytesPerPartition}
              timeDuration={timeDuration}
              isLoading={isLoading}
              selectedTopic={selectedTopic}
              onRefresh={onRefresh}
              onSelectedTopic={onTopicChange}
              onTimeDuration={onDurationChange}
            />
          </GridItem>
        </Grid>
      ) : (
        <ChartEmptyState
          title={t("metrics.empty_state_no_data_title")}
          body={t("metrics.empty_state_no_data_body")}
          noData
        />
      )}
    </PageSection>
  );
};
