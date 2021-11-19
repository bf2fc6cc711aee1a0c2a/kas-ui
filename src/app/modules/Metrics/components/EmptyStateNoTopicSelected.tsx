import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const EmptyStateNoTopicSelected = () => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={FilterIcon} />
      <Title headingLevel='h3' size='lg'>
        {t('metrics.empty_state_no_filter_title')}
      </Title>
      <EmptyStateBody>{t('metrics.empty_state_no_filter_body')}</EmptyStateBody>
    </EmptyState>
  );
};
