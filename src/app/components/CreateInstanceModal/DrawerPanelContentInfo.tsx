import React from 'react';
import { DrawerPanelContent, DrawerHead, TextContent } from '@patternfly/react-core';

const DrawerPanelContentInfo = () => (
  <DrawerPanelContent className="instance-details-panel">
    <DrawerHead>
      <TextContent>
        <h2>Cluster information</h2>
        <dl>
          <dt>Ingress/Egress</dt>
          <dd>up to 4MB/s</dd>
          <dt>Storage</dt>
          <dd>up to 100GB</dd>
          <dt>Partitions</dt>
          <dd>up to 100</dd>
          <dt>Client connections</dt>
          <dd>up to 500</dd>
          <dt>Message size</dt>
          <dd>up to 1MB</dd>
          <dt>Availability</dt>
          <dd>Multizone highly available</dd>
        </dl>
        <h2>Cost information</h2>
        <dl>
          <dt>Base Cluster</dt>
          <dd>$1.50/hour</dd>
          <dt>Ingress/Egress</dt>
          <dd>$0.02/MB</dd>
          <dt>Storage</dt>
          <dd>$0.0002/GB/hour</dd>
        </dl>
      </TextContent>
    </DrawerHead>
  </DrawerPanelContent>
);

export { DrawerPanelContentInfo };
