import {
  DefaultEmptyState,
  DefaultEmptyStateProps,
} from '@app/common/ServiceTable/ConnectedTable/DefaultEmptyState';
import React from 'react';
import { MaxCapacityEmptyState } from '@app/common/ServiceTable/ConnectedTable/MaxCapacityEmptyState';

type EmptyStateProps = DefaultEmptyStateProps;

export const ServiceTableConnectedEmptyState: React.FunctionComponent<EmptyStateProps> =
  ({
    maxCapacityReached,
    handleCreateInstanceModal,
    createButtonDisabled,
    instanceExists,
  }) => {
    if (maxCapacityReached) {
      return <MaxCapacityEmptyState />;
    } else {
      return (
        <DefaultEmptyState
          instanceExists={instanceExists}
          createButtonDisabled={createButtonDisabled}
          maxCapacityReached={maxCapacityReached}
          handleCreateInstanceModal={handleCreateInstanceModal}
        />
      );
    }
  };
