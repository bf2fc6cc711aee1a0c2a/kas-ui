import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSection, Title, Button, EmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import './UnexpectedError.css';

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
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateIcon icon={ExclamationCircleIcon} className="icon-color" />
        <Title headingLevel="h1" size="lg">
          {t('something_went_wrong')}
        </Title>
        <EmptyStateBody>{t('unexpected_error')}</EmptyStateBody>
        <GoHomeBtn />
      </EmptyState>
    </PageSection>
  );
};

export { UnexpectedError };
