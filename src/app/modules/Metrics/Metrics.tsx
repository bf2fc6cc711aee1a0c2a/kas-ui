import React, { useState } from 'react';
import {
  UsedDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic,
} from '@app/modules/Metrics/Charts';
import { InputGroup, TextInput, Button, Grid, GridItem, PageSection } from '@patternfly/react-core';

export interface MetricsProps {
  kafkaId: string;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId }) => {
  return (
    <PageSection>
      {/* <InputGroup>
        <TextInput id="1" aria-label="Text input"/>
      </InputGroup>
      <Button>
        Change KafkaID
      </Button> */}
      <Grid hasGutter>
        <GridItem>
          <UsedDiskSpaceChart kafkaID={kafkaId} />
        </GridItem>
        <GridItem>
          <IncomingOutgoingBytesPerTopic kafkaID={kafkaId} />
        </GridItem>
        {/* <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem> */}
      </Grid>
    </PageSection>
  );
};
