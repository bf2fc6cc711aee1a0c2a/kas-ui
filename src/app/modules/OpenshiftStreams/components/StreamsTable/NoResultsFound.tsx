import React from 'react';
import { MASEmptyState, MASEmptyStateVariant } from '@app/common';
import { useTranslation } from 'react-i18next';

export type NoResultsFoundProps = {
  count: number;
  dataLoaded: boolean;
};
export const NoResultsFound: React.FunctionComponent<NoResultsFoundProps> = ({
  count,
  dataLoaded,
}) => {
  const { t } = useTranslation(['kasTemporaryFixMe']);

  if (count < 1 && dataLoaded) {
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
  }
  return <></>;
};
