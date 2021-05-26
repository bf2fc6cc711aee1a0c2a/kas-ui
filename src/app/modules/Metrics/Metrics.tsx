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


  const kafkaID: string = '1sz9wq5VNwDPoTDJmsGDvtN4UnI'; // Christie
  const kafkaID2: string = '1sAjoh9EO1P3PiEPTcADdt343jB'; // Jenn

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <UsedDiskSpaceChart kafkaID={kafkaID}/>
        </GridItem>
        <IncomingOutgoingBytesPerTopic kafkaID={kafkaID}/>
        <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
