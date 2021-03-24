import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSection, TitleSizes, Button, EmptyStateVariant } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import './UnexpectedError.css';
import { MASEmptyState } from '@app/common';

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
    return <Button onClick={handleClick}>{t('go_to_openshift_streams')}</Button>;
  };

  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <MASEmptyState
        emptyStateProps={{
          variant: EmptyStateVariant.full,
        }}
        emptyStateIconProps={{
          icon: ExclamationCircleIcon,
          className: 'icon-color',
        }}
        titleProps={{
          title: t('common.something_went_wrong'),
          headingLevel: 'h1',
          size: TitleSizes.lg,
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
