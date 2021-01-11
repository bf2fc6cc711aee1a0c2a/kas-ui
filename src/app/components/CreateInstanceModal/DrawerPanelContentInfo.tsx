import React from 'react';
import { DrawerPanelContent, DrawerHead, TextContent, Text, TextVariants } from '@patternfly/react-core';

const DrawerPanelContentInfo = () => (
  <DrawerPanelContent className="instance-details-panel">
    <DrawerHead>
      <TextContent>
        <Text component={TextVariants.h2}>Cluster information</Text>
        <Text component={TextVariants.h3}>Ingress/Egress</Text>
        <Text component={TextVariants.p}>up to 4 MBps</Text>
        <Text component={TextVariants.h3}>Storage</Text>
        <Text component={TextVariants.p}>up to 100 GB</Text>
        <Text component={TextVariants.h3}>Partitions</Text>
        <Text component={TextVariants.p}>up to 100</Text>
        <Text component={TextVariants.h3}>Client connections</Text>
        <Text component={TextVariants.p}>up to 100</Text>
        <Text component={TextVariants.h3}>Message size</Text>
        <Text component={TextVariants.p}>up to 1 MB</Text>
        <Text component={TextVariants.h3}>Availability</Text>
        <Text component={TextVariants.p}>Multizone highly available</Text>
        <Text component={TextVariants.h2}>Cost information</Text>
        <Text component={TextVariants.h3}>Base Cluster</Text>
        <Text component={TextVariants.p}>$1.50/hr</Text>
        <Text component={TextVariants.h3}>Ingress/Egress</Text>
        <Text component={TextVariants.p}>$0.02/MB</Text>
        <Text component={TextVariants.h3}>Storage</Text>
        <Text component={TextVariants.p}>$0.0002/GB/hr</Text>
      </TextContent>
    </DrawerHead>
  </DrawerPanelContent>
);

export { DrawerPanelContentInfo };
