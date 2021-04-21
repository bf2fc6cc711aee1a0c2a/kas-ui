import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultApi } from 'src/openapi';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import {
  AvailableDiskSpaceChart,
  LogSizePerPartitionChart,
  IncomingBytesPerTopicChart,
  OutgoingBytesPerTopicChart,
} from '@app/modules/Metrics/Charts';
import { 

  Grid,
  GridItem,
  PageSection
} from '@patternfly/react-core';

export const Metrics = () => {

  const kafkaID: string = '1rGPabXMVG7cSONKOdPk0eAY2mZ';

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <AvailableDiskSpaceChart kafkaID={kafkaID}/>
        </GridItem>
        <GridItem span={6}>
          <IncomingBytesPerTopicChart kafkaID={kafkaID}/>
        </GridItem>
        <GridItem span={6}>
          <OutgoingBytesPerTopicChart kafkaID={kafkaID}/>
        </GridItem>
        <GridItem>
          <LogSizePerPartitionChart kafkaID={kafkaID}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
