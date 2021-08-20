import React from 'react';
import {
  Button,
  ButtonVariant,
  EmptyStateVariant,
  TitleSizes,
} from '@patternfly/react-core';
import {
  QuickStartContext,
  QuickStartContextValues,
} from '@cloudmosaic/quickstarts';
import { MASEmptyState } from '@app/common';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import {
  CreateInstanceButton,
  CreateInstanceButtonProps,
} from '@app/common/ServiceTable/ConnectedTable/CreateInstanceButton';

export type DefaultEmptyStateProps = CreateInstanceButtonProps;

export const DefaultEmptyState: React.FunctionComponent<DefaultEmptyStateProps> =
  ({
    handleCreateInstanceModal,
    instanceExists,
    createButtonDisabled,
    maxCapacityReached,
  }) => {
    const qsContext: QuickStartContextValues =
      React.useContext(QuickStartContext);

    return (
      <MASEmptyState
        emptyStateProps={{
          variant: EmptyStateVariant.large,
        }}
        emptyStateIconProps={{
          icon: CheckCircleIcon,
          color: 'green',
        }}
        emptyStateBodyProps={{
          body: (
            <>
              Development preview instances are available for creation. For help
              getting started, access the{' '}
              <Button
                variant={ButtonVariant.link}
                isSmall
                isInline
                onClick={() =>
                  qsContext.setActiveQuickStart &&
                  qsContext.setActiveQuickStart('getting-started')
                }
              >
                quick start guide.
              </Button>
            </>
          ),
        }}
        titleProps={{
          title: 'Kafka instances available',
          size: TitleSizes.xl,
          headingLevel: 'h2',
        }}
      >
        <CreateInstanceButton
          instanceExists={instanceExists}
          createButtonDisabled={createButtonDisabled}
          maxCapacityReached={maxCapacityReached}
          handleCreateInstanceModal={handleCreateInstanceModal}
        />
      </MASEmptyState>
    );
  };
