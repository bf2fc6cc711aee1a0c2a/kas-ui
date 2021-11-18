import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { SpinnerIcon } from '@patternfly/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const EmptyStateInitialLoading = () => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={SpinnerIcon} />
      <Title headingLevel='h3' size='lg'>
        {t('metrics.empty_state_loading_title')}
      </Title>
      <EmptyStateBody>{t('metrics.empty_state_loading_body')}</EmptyStateBody>
    </EmptyState>
  );
};
