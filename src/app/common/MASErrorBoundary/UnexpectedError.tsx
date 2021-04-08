import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSection, Button } from '@patternfly/react-core';
import './UnexpectedError.css';
import { MASEmptyState, MASEmptyStateVariant } from '@app/common';

type UnexpectedError = {
  updateState: (hasError: boolean) => void;
};

const UnexpectedError = ({ updateState }: UnexpectedError) => {
  const { t } = useTranslation();

  const GoHomeBtn = () => {
    const history = useHistory();
    function handleClick() {
      updateState(false);
      history.push('/');
    }
    return <Button onClick={handleClick}>{t('go_to_kafka_instances')}</Button>;
  };

  return (
    <PageSection padding={{ default: 'noPadding' }} isFilled>
      <MASEmptyState
        emptyStateProps={{
          variant: MASEmptyStateVariant.UnexpectedError,
        }}
        emptyStateIconProps={{
          className: 'icon-color',
        }}
        titleProps={{
          title: t('common.something_went_wrong'),
        }}
        emptyStateBodyProps={{
          body: t('unexpected_error'),
        }}
      >
        <GoHomeBtn />
      </MASEmptyState>
    </PageSection>
  );
};

export { UnexpectedError };
