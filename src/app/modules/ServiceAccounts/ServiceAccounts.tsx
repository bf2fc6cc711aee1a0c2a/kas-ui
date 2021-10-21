import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ServiceAccountsTableConnected } from '@app/modules/ServiceAccounts/components/ServiceAccountsTableConnected';
import '@app/modules/styles.css';

const ServiceAccounts: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageSection
        variant={PageSectionVariants.light}
        className='mk--main-page__page-section--table pf-m-padding-on-xl'
        padding={{ default: 'noPadding' }}
      >
        <TextContent>
          <Text component='h1'> {t('serviceAccount.service_accounts')}</Text>
          <Text component='p'>
            {t('serviceAccount.service_accounts_title_header_info')}
          </Text>
        </TextContent>
      </PageSection>
      <ServiceAccountsTableConnected />
    </>
  );
};

export { ServiceAccounts };
