import React from 'react';
import {
  DrawerPanelContent,
  DrawerHead,
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
} from '@patternfly/react-core';

const DrawerPanelContentInfo = () => (
  <DrawerPanelContent className="instance-details-panel">
    <DrawerHead>
      <TextContent>
        <Text component={TextVariants.h2}>Cluster information</Text>
        <TextList component={TextListVariants.dl}>
          <TextListItem component={TextListItemVariants.dt}>Ingress/Egress</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 4 MBps</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Storage</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 100 GB</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Partitions</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 100</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Client connections</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 500</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Message size</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>up to 1 MB</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Availability</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>Multizone highly available</TextListItem>
        </TextList>
        <Text component={TextVariants.h2}>Cost information</Text>
        <TextList component={TextListVariants.dl}>
          <TextListItem component={TextListItemVariants.dt}>Base Cluster</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>$1.50/hr</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Ingress/Egress</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>$0.02/MB</TextListItem>
          <TextListItem component={TextListItemVariants.dt}>Storage</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>$0.0002/GB/hr</TextListItem>
        </TextList>
      </TextContent>
    </DrawerHead>
  </DrawerPanelContent>
);

export { DrawerPanelContentInfo };
