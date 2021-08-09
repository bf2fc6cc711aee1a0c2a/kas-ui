import React from "react";
import { useTranslation } from "react-i18next";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";
import { MASEmptyState } from "@app/common";
import LockIcon from "@patternfly/react-icons/dist/js/icons/lock-icon";

export const UserUnauthorized: React.FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <PageSection variant={PageSectionVariants.default} padding={{ default: 'noPadding' }} isFilled>
      <MASEmptyState
        titleProps={{
          title: t('serviceAccount.unauthorized_access_to_service_accounts_title'),
          headingLevel: 'h2',
        }}
        emptyStateIconProps={{
          icon: LockIcon,
        }}
        emptyStateBodyProps={{
          body: t('serviceAccount.unauthorized_access_to_service_accounts_info'),
        }}
      />
    </PageSection>
  );
};
