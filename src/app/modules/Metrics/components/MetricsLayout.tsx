import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import React, { ReactNode, FunctionComponent } from 'react';

type MetricsLayoutProps = {
  diskSpaceMetrics: ReactNode;
  topicMetrics: ReactNode;
};
export const MetricsLayout: FunctionComponent<MetricsLayoutProps> = ({
  diskSpaceMetrics,
  topicMetrics,
}) => {
  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem lg={6}>{diskSpaceMetrics}</GridItem>
        <GridItem lg={6}>{topicMetrics}</GridItem>
      </Grid>
    </PageSection>
  );
};
