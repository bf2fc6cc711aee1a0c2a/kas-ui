import React from 'react';
import {
  AvailableDiskSpaceChart,
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


  const kafkaID: string = '1s1vFw4u4GYZS7wzHtGZr2dZrlW'; // Christie
  const kafkaID2: string = '1roSHSqyJhtass3R3WvjAxb8q5w'; // Jenn

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <AvailableDiskSpaceChart kafkaID={kafkaID}/>
        </GridItem>
        <IncomingOutgoingBytesPerTopic kafkaID={kafkaID}/>
        <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
