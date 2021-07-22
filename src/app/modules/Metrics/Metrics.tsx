import React, { useState } from 'react';
import {
  UsedDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic,
} from '@app/modules/Metrics/Charts';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import { ChartEmptyState } from './Charts/ChartEmptyState';
import { useTranslation } from 'react-i18next';

export interface MetricsProps {
  kafkaId: string;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId }) => {
  const [metricsDataUnavailable, setMetricsDataUnavailable] = useState(false);
  const kafkaID = kafkaId || '1vca460i43rGHzPBsFhERrw7L9P';
  const { t } = useTranslation();

  return (
    <PageSection>
      {!metricsDataUnavailable ? (
        <Grid hasGutter>
          <GridItem>
            <UsedDiskSpaceChart
              kafkaID={kafkaID}
              metricsDataUnavailable={metricsDataUnavailable}
              setMetricsDataUnavailable={setMetricsDataUnavailable}
            />
          </GridItem>
          <GridItem>
            <IncomingOutgoingBytesPerTopic
              metricsDataUnavailable={metricsDataUnavailable}
              setMetricsDataUnavailable={setMetricsDataUnavailable}
              kafkaID={kafkaID}
            />
          </GridItem>
          {/* <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem> */}
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
