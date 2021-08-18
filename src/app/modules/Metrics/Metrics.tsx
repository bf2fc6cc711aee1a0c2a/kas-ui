import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import { UsedDiskSpaceChart, IncomingOutgoingBytesPerTopic } from '@app/modules/Metrics/components';
import { ChartEmptyState } from './components/ChartEmptyState';

export interface MetricsProps {
  kafkaId: string;
  onCreateTopic: () => void;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);

  const { t } = useTranslation();

  return (
    <PageSection>
      {!metricsDataUnavailable ? (
        <Grid hasGutter>
          <GridItem>
            <UsedDiskSpaceChart
              kafkaID={kafkaId}
              metricsDataUnavailable={metricsDataUnavailable}
              setMetricsDataUnavailable={setMetricsDataUnavailable}
            />
          </GridItem>
          <GridItem>
            <IncomingOutgoingBytesPerTopic
              metricsDataUnavailable={metricsDataUnavailable}
              setMetricsDataUnavailable={setMetricsDataUnavailable}
              kafkaID={kafkaId}
              onCreateTopic={onCreateTopic}
            />
          </GridItem>
        </Grid>
      ) : (
        <ChartEmptyState
          title={t('metrics.empty_state_no_data_title')}
          body={t('metrics.empty_state_no_data_body')}
          noData
        />
      )}
    </PageSection>
  );
};
