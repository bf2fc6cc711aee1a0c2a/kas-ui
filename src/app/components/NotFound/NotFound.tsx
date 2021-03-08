import React from 'react';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { useTranslation } from 'react-i18next';
import { PageSection, Button, EmptyStateVariant, TitleSizes } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import { MASEmptyState } from '@app/common';

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
    <PageSection padding={{ default: 'noPadding' }}>
      <MASEmptyState
        emptyStateProps={{ variant: EmptyStateVariant.full }}
        emptyStateIconProps={{ icon: ExclamationTriangleIcon }}
        titleProps={{ title: t('404_page_not_found'), headingLevel: 'h1', size: TitleSizes.lg }}
        emptyStateBodyProps={{
          body: t('we_did_not_find_a_page_that_matches_the_address_you_navigated_to'),
        }}
      >
        <GoHomeBtn />
      </MASEmptyState>
    </PageSection>
  );
};

export { NotFound };
