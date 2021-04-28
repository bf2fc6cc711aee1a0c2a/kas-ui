import React from 'react';
import {
  AvailableDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic
} from '@app/modules/Metrics/Charts';
import { 
  Grid,
  GridItem,
  PageSection
} from '@patternfly/react-core';

export const Metrics = () => {

  const kafkaID: string = '1rief1YRUt06JdUM4aR5DrMiwGs';
  const kafkaID2: string = '1rknQ7vbgO5LVkkWsQQU4v4Pjg1';
  const kafkaID3: string = '1rkDflm4QfioB8vUur2a8Zzu2cU';

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
