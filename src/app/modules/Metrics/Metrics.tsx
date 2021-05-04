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


  const kafkaID: string = '1s5YBrdgvsZDrofp5QFx2OaeGh5'; // Christie
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
