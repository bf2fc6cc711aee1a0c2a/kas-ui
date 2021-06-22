import React from 'react';
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateIcon,
  Title
} from '@patternfly/react-core';
import TachometerAltIcon from '@patternfly/react-icons/dist/js/icons/tachometer-alt-icon';
import WrenchIcon from '@patternfly/react-icons/dist/js/icons/wrench-icon';


type ChartEmptyState = {
  title: string
  body: string
  noData?: boolean
  noTopics?: boolean
}

export const ChartEmptyState = ({title, body, noData, noTopics}: ChartEmptyState) => {

  const getIcon = () => {
    if(noData) {
      return TachometerAltIcon;
    }
    else if(noTopics) {
      return WrenchIcon;
    }
  }

  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={getIcon()} />
      <Title headingLevel="h3" size="lg">
        {title}
      </Title>
      <EmptyStateBody>
        {body}
      </EmptyStateBody>
    </EmptyState>
  );
}