import React from 'react';
import { useTranslation } from 'react-i18next';
import { MASEmptyState, MASEmptyStateVariant } from '@app/common';

export const ServiceTableEmptyState: React.FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <MASEmptyState
      emptyStateProps={{
        variant: MASEmptyStateVariant.NoResult,
      }}
      titleProps={{
        title: t('no_results_found'),
      }}
      emptyStateBodyProps={{
        body: t('adjust_your_filters_and_try_again'),
      }}
    />
  );
};
