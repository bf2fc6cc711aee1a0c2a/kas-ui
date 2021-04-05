import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageSection, Button } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import { MASEmptyState, MASEmptyStateVariant } from '@app/common';

const MASPageNotFound: React.FunctionComponent = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return <Button onClick={handleClick}>{t('return_to_home_page')}</Button>;
  }

  return (
    <PageSection padding={{ default: 'noPadding' }} isFilled>
      <MASEmptyState
        emptyStateProps={{ variant: MASEmptyStateVariant.PageNotFound }}
        titleProps={{ title: t('404_page_does_not_exist') }}
        emptyStateBodyProps={{
          body: t('we_cannot_find_the_page_you_are_looking_for'),
        }}
      >
        <GoHomeBtn />
      </MASEmptyState>
    </PageSection>
  );
};

export { MASPageNotFound };
