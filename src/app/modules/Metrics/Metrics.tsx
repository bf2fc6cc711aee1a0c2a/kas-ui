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

  const kafkaID: string = '1rAvUD7CFXIm2M3mj2pjtpHExWw';

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <AvailableDiskSpaceChart kafkaId={{id: '1rGHY9WURtN71LcftnEn8IgUGaa'}}/>
        </GridItem>
        <GridItem span={6}>
          <IncomingBytesPerTopicChart kafkaId={kafkaID}/>
        </GridItem>
        <GridItem span={6}>
          <OutgoingBytesPerTopicChart kafkaId={kafkaID}/>
        </GridItem>
        <GridItem>
          <LogSizePerPartitionChart kafkaId={kafkaID}/>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
