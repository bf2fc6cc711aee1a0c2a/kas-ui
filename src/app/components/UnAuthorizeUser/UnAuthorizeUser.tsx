import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

const UnAuthorizeUser = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1" size="lg">
              {t('openshift_streams')}
            </Title>
          </LevelItem>
        </Level>
      </PageSection>
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={LockIcon} />
        <Title headingLevel="h2" size="lg">
          {t('you_do_not_have_access_of_openshift_streams')}
        </Title>
        <EmptyStateBody>{t('contact_your_organization_administration_for_more_information')}</EmptyStateBody>
      </EmptyState>
    </>
  );
};

export { UnAuthorizeUser };
