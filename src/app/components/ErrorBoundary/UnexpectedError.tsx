import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSection, Title, Button, EmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

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
    return <Button onClick={handleClick}>{t('Take me home')}</Button>;
  };

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h1" size="lg">
          {t('unexpected_error')}
        </Title>
        <EmptyStateBody>{t('something_went_wrong')}</EmptyStateBody>
        <GoHomeBtn />
      </EmptyState>
    </PageSection>
  );
};

export { UnexpectedError };
