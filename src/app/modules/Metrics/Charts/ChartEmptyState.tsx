import React from 'react';
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateIcon,
  Title
} from '@patternfly/react-core';
import TachometerAltIcon from '@patternfly/react-icons/dist/js/icons/tachometer-alt-icon';


export const ChartEmptyState = () => {

  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={TachometerAltIcon} />
      <Title headingLevel="h3" size="lg">
        No data yet
      </Title>
      <EmptyStateBody>
        We’re creating your Kafka instance, so some details aren’t yet available.
      </EmptyStateBody>
    </EmptyState>
  );
}