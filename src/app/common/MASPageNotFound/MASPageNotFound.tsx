import React from 'react';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { useTranslation } from 'react-i18next';
import { PageSection, Button, EmptyStateVariant, TitleSizes } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import { MASEmptyState } from '@app/common';

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
    <PageSection padding={{ default: 'noPadding' }}>
      <MASEmptyState
        emptyStateProps={{ variant: EmptyStateVariant.full }}
        emptyStateIconProps={{ icon: ExclamationTriangleIcon }}
        titleProps={{ title: t('404_page_does_not_exist'), headingLevel: 'h1', size: TitleSizes.lg }}
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
