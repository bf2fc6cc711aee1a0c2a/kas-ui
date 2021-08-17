import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core';
import { ServiceAccountsTableConnected } from '@app/modules/ServiceAccounts/components/ServiceAccountsTableConnected';

const ServiceAccounts: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component="h1"> {t('serviceAccount.service_accounts')}</Text>
          <Text component="p">{t('serviceAccount.service_accounts_title_header_info')}</Text>
        </TextContent>
      </PageSection>
      <ServiceAccountsTableConnected />
    </>
  );
};

export { ServiceAccounts };
