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
  const kafkaID2: string = '1sAjoh9EO1P3PiEPTcADdt343jB'; // Jenn

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <AvailableDiskSpaceChart kafkaID={kafkaID2}/>
        </GridItem>
        <IncomingOutgoingBytesPerTopic kafkaID={kafkaID2}/>
        <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID2}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
