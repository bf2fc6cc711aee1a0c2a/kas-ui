import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { MASEmptyState } from '@app/common';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';

export const Unauthorized: React.FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <PageSection
      variant={PageSectionVariants.default}
      padding={{ default: 'noPadding' }}
      isFilled
    >
      <MASEmptyState
        titleProps={{
          title: t('access_permissions_needed'),
          headingLevel: 'h2',
        }}
        emptyStateIconProps={{
          icon: LockIcon,
        }}
        emptyStateBodyProps={{
          body: t(
            'to_access_kafka_instances_contact_your_organization_administrators'
          ),
        }}
      />
    </PageSection>
  );
};
