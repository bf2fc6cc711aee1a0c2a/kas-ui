import React from 'react';
import {
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  Grid,
  GridItem,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';

const DrawerPanelContentInfo = () => (
  <TextContent>
    <Text component={TextVariants.h2}>Instance information</Text>
    <TextList component={TextListVariants.dl}>
      <Grid sm={6} lg={12} hasGutter>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Duration</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>48 hours</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Ingress/Egress</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 2 MB/s each</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Storage</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 60 GB</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Partitions</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 100</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Client connections</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 100</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Client attempts</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 50/s</TextListItem>
        </GridItem>
        <GridItem>
          <TextListItem component={TextListItemVariants.dt}>Message size</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 1 MB</TextListItem>
        </GridItem>
      </Grid>
      <Button isSmall isInline variant={ButtonVariant.link} style={{ marginTop: '20px' }}>
        Need help getting started ? Follow our quck start resouces.
      </Button>
    </TextList>
  </TextContent>
);

export { DrawerPanelContentInfo };
