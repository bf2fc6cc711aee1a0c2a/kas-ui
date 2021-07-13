import React from 'react';
import {
  UsedDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic,
} from '@app/modules/Metrics/Charts';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';

export interface MetricsProps {
  kafkaId: string;
}

export const Metrics: React.FC<MetricsProps> = ({ kafkaId }) => {
  const kafkaID = kafkaId || '1vFpbfjQqSXGVYqSxCX5I1xdfj2';
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
          <UsedDiskSpaceChart kafkaID={kafkaID} />
        </GridItem>
        <GridItem>
          <IncomingOutgoingBytesPerTopic kafkaID={kafkaID} />
        </GridItem>
        {/* <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem> */}
      </Grid>
    </PageSection>
  );
};
