import React from 'react';
import { EmptyState, EmptyStateVariant, EmptyStateBody, EmptyStateIcon, Title, Button } from '@patternfly/react-core';
import TachometerAltIcon from '@patternfly/react-icons/dist/js/icons/tachometer-alt-icon';
import WrenchIcon from '@patternfly/react-icons/dist/js/icons/wrench-icon';
import { FilterIcon } from '@patternfly/react-icons';

type ChartEmptyState = {
  title: string;
  body: string;
  noData?: boolean;
  noTopics?: boolean;
  noFilter?: boolean;
};

export const ChartEmptyState = ({ title, body, noData, noTopics, noFilter }: ChartEmptyState) => {
  const getIcon = () => {
    if (noData) {
      return TachometerAltIcon;
    } else if (noTopics) {
      return WrenchIcon;
    } else if (noFilter) {
      return FilterIcon;
    }
    return;
  };

  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={getIcon()} />
      <Title headingLevel="h3" size="lg">
        {title}
      </Title>
      <EmptyStateBody>
        {body}
        <br />
        <br />
        {noTopics && <Button variant="primary">Create Topic</Button>}
      </EmptyStateBody>
    </EmptyState>
  );
};
