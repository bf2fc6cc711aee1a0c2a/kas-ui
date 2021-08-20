import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

export type CreateInstanceButtonProps = {
  instanceExists: boolean;
  createButtonDisabled: boolean;
  maxCapacityReached: boolean;
  handleCreateInstanceModal: () => Promise<void>;
};

export const CreateInstanceButton: React.FunctionComponent<CreateInstanceButtonProps> =
  ({
    instanceExists,
    createButtonDisabled,
    maxCapacityReached,
    handleCreateInstanceModal,
  }) => {
    const { t } = useTranslation();
    /**
     * Todo: remove after summit
     */
    const getButtonTooltipContent = () => {
      if (createButtonDisabled) {
        if (maxCapacityReached && instanceExists) {
          return 'You can deploy 1 preview instance at a time.';
        } else if (maxCapacityReached) {
          return 'Development preview instances are currently unavailable for creation.';
        } else {
          return 'You can deploy 1 preview instance at a time.';
        }
      }
      return '';
    };

    if (createButtonDisabled) {
      const content = getButtonTooltipContent();
      return (
        <Tooltip content={content}>
          <Button
            data-testid='emptyStateStreams-buttonCreateKafka'
            variant={ButtonVariant.primary}
            onClick={handleCreateInstanceModal}
            isAriaDisabled={createButtonDisabled}
          >
            {t('create_kafka_instance')}
          </Button>
        </Tooltip>
      );
    }
    return (
      <Button
        data-testid='emptyStateStreams-buttonCreateKafka'
        variant={ButtonVariant.primary}
        onClick={handleCreateInstanceModal}
      >
        {t('create_kafka_instance')}
      </Button>
    );
  };
