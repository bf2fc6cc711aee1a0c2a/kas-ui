import React from 'react';
import {
  UsedDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic
} from '@app/modules/Metrics/Charts';
import { 
  Button,
  Grid,
  GridItem,
  PageSection
} from '@patternfly/react-core';

export const Metrics = () => {


  const kafkaID: string = '1t46zfZ0pnhx9aRa0BwFHCfdVmp'; // Christie
  const kafkaID2: string = '1sAjoh9EO1P3PiEPTcADdt343jB'; // Jenn

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <UsedDiskSpaceChart kafkaID={kafkaID}/>
        </GridItem>
        <GridItem>
          <IncomingOutgoingBytesPerTopic kafkaID={kafkaID}/>
        </GridItem>
        <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
