import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  TextContent,
  Text,
  TextVariants,
  ClipboardCopy,
  Label,
  Popover,
  Skeleton,
  ButtonVariant,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { KafkaRequest } from '../../../../../openapi/api';
import HelpIcon from '@patternfly/react-icons/dist/js/icons/help-icon';
import { CreateServiceAccountModal } from '@app/modules/ServiceAccounts/components';

export type ResourcesTabProps = {
  mainToggle?: boolean;
  externalServer?: string;
  instance: KafkaRequest | undefined;
  isKafkaPending?: boolean;
  onConnectToRoute: (data: KafkaRequest, routePath: string) => void;
  getConnectToRoutePath: (data: KafkaRequest, routePath: string) => string;
  tokenEndPointUrl: string;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  mainToggle,
  externalServer,
  instance = {},
  isKafkaPending,
  onConnectToRoute,
  getConnectToRoutePath,
  tokenEndPointUrl,
}: ResourcesTabProps) => {
  const { t } = useTranslation();
  const [isCreateServiceAccountModalOpen, setIsCreateServiceAccountModalOpen] = useState(false);

  return (
    <div className="mas--details__drawer--tab-content">
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_1')}</Text>
        <Text component={TextVariants.h3} className="pf-u-mt-lg">
          {t('bootstrap_server')}
        </Text>
        <Text component={TextVariants.small}>{t('bootstrap_server_description')}</Text>
      </TextContent>
      {isKafkaPending ? (
        <Skeleton fontSize="2xl" />
      ) : (
        <ClipboardCopy data-testid="drawerStreams-copyBootstrapURL" textAriaLabel={t('bootstrap_server')}>
          {externalServer}
        </ClipboardCopy>
      )}

      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h3} className="pf-u-mt-xl">
          {t('serviceAccount.service_accounts_small')}
        </Text>
        <Text component={TextVariants.small}>
          {t('serviceAccount.create_service_account_to_generate_credentials')}{' '}
          <Link
            to={() => getConnectToRoutePath(instance, 'service-accounts')}
            onClick={(e) => {
              e.preventDefault();
              onConnectToRoute(instance, 'service-accounts');
            }}
            data-testid="tableStreams-linkKafka"
          >
            {t('serviceAccount.service_accounts')}
          </Link>{' '}
          {t('common.page')}.
        </Text>
      </TextContent>
      <Button
        variant="secondary"
        onClick={() => setIsCreateServiceAccountModalOpen(true)}
        data-testid="drawerStreams-buttonCreateServiceAccount"
        isInline
      >
        {t('serviceAccount.create_service_account')}
      </Button>
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h3} className="pf-u-mt-xl">
          {t('common.authentication_method')}
        </Text>
        <Text component={TextVariants.h4} className="pf-u-mt-md">
          {t('common.sasl_oauthbearer')} <Label color="green">{t('common.recommended')}</Label>
          <Popover
            aria-label={t('common.sasl_oauthbearer')}
            bodyContent={<div>{t('serviceAccount.sasl_oauthbearer_popover_content')}</div>}
          >
            <Button variant={ButtonVariant.plain} aria-label={t('more_info_about_sasl_oauthbearer')}>
              <HelpIcon />
            </Button>
          </Popover>
        </Text>
        <Text component={TextVariants.small}>{t('serviceAccount.sasl_oauthbearer_description')}</Text>
        <Text component={TextVariants.h6} className="pf-u-mt-md">
          {t('common.token_endpoint_url')}
        </Text>
        {isKafkaPending ? <Skeleton fontSize="2xl" /> : <ClipboardCopy>{tokenEndPointUrl}</ClipboardCopy>}
      </TextContent>
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h4} className="pf-u-mt-md">
          {t('common.sasl_plain')}
        </Text>
        <Text component={TextVariants.small}>{t('serviceAccount.sasl_plain_description')}</Text>
      </TextContent>
      {mainToggle && (
        <>
          <TextContent className="pf-u-pb-sm pf-u-pt-lg">
            <Text component={TextVariants.h5}>Producer endpoint and credentials</Text>
            <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_3')}</Text>
          </TextContent>
          <ClipboardCopy>https://:30123</ClipboardCopy>
        </>
      )}
      <CreateServiceAccountModal
        isOpen={isCreateServiceAccountModalOpen}
        setIsOpen={setIsCreateServiceAccountModalOpen}
      />
    </div>
  );
};
