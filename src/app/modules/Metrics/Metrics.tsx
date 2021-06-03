import React, {useState} from 'react';
import {
  UsedDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingOutgoingBytesPerTopic
} from '@app/modules/Metrics/Charts';
import { 
  InputGroup,
  TextInput,
  Button,
  Grid,
  GridItem,
  PageSection
} from '@patternfly/react-core';

export const Metrics = () => {


  // const kafkaID: string = '1tObNFa1hWUBINi27PBW76rDKAt';
  
  const [kafkaID, setKafkaID] = useState<string>('1tPLvSslH4L76YfTK4IYtZu75dF');

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
          <UsedDiskSpaceChart kafkaID={kafkaID}/>
        </GridItem>
        <GridItem>
          <IncomingOutgoingBytesPerTopic kafkaID={kafkaID}/>
        </GridItem>
        {/* <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem> */}
      </Grid>
    </PageSection>
  );
};
