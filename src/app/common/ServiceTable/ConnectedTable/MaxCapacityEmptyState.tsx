import React from 'react';
import { MASEmptyState } from '@app/common';
import {
  Button,
  ButtonVariant,
  EmptyStateVariant,
  TitleSizes,
} from '@patternfly/react-core';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';

export const MaxCapacityEmptyState: React.FunctionComponent = () => {
  return (
    <MASEmptyState
      emptyStateProps={{
        variant: EmptyStateVariant.large,
      }}
      emptyStateIconProps={{
        icon: BanIcon,
      }}
      emptyStateBodyProps={{
        body: (
          <>
            Development preview instances are currently unavailable for
            creation, so check back later. In the meantime,{' '}
            <Button
              variant={ButtonVariant.link}
              isSmall
              isInline
              data-testid='emptyState-actionTour'
            >
              take a tour
            </Button>{' '}
            to learn more about the service.
          </>
        ),
      }}
      titleProps={{
        title: 'Kafka instances unavailable',
        size: TitleSizes.xl,
        headingLevel: 'h2',
      }}
    />
  );
};
