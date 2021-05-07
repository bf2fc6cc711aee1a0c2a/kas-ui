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


  const kafkaID: string = '1sDDlIS2rQAFYajLBOoV1QKEKCS'; // Christie
  const kafkaID2: string = '1sAjoh9EO1P3PiEPTcADdt343jB'; // Jenn

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
