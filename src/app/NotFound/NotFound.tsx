import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageSection, Title, Button, EmptyState, EmptyStateIcon, EmptyStateBody } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

const NotFound: React.FunctionComponent = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return <Button onClick={handleClick}>{t('take_me_home')}</Button>;
  }

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h1" size="lg">
          {t('404_page_not_found')}
        </Title>
        <EmptyStateBody>{t('we_did_not_find_a_page_that_matches_the_address_you_navigated_to')}</EmptyStateBody>
        <GoHomeBtn />
      </EmptyState>
    </PageSection>
  );
};

export { NotFound };
