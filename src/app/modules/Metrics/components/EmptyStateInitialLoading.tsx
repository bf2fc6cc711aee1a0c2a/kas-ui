import { MASLoading } from '@app/common';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import React from 'react';

export const EmptyStateInitialLoading = () => {
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateBody>
        <MASLoading />
      </EmptyStateBody>
    </EmptyState>
  );
};
