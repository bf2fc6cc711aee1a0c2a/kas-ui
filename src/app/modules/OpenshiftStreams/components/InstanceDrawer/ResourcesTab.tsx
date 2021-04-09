import React, { useState, useContext } from 'react';
import {
  Button,
  TextContent,
  Text,
  TextVariants,
  ClipboardCopy,
  ButtonVariant,
  Label,
  Popover,
  Skeleton,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { MASGenerateCredentialsModal } from '@app/common/MASGenerateCredentialsModal/MASGenerateCredentialsModal';
import { ApiContext } from '@app/api/ApiContext';
import { AuthContext } from '@app/auth/AuthContext';
import { isServiceApiError } from '@app/utils/error';
import { DefaultApi, ServiceAccountRequest } from '../../../../../openapi/api';
import HelpIcon from '@patternfly/react-icons/dist/js/icons/help-icon';

export type ResourcesTabProps = {
  mainToggle?: boolean;
  externalServer?: string;
  instanceName?: string;
  isKafkaPending?: boolean;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  mainToggle,
  externalServer,
  instanceName = '',
  isKafkaPending,
}: ResourcesTabProps) => {
  const { t } = useTranslation();
  const { basePath } = useContext(ApiContext);
  const authContext = useContext(AuthContext);

  const [isGenerateCredentialsModalOpen, setIsGenerateCredentialsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [credential, setCredential] = useState<any | undefined>();

  const generateCredential = async () => {
    const accessToken = await authContext?.getToken();
    const serviceAccountRequest: ServiceAccountRequest = {
      name: instanceName,
    };
    const apisService = new DefaultApi({
      accessToken,
      basePath,
    });

    try {
      await apisService.createServiceAccount(serviceAccountRequest).then((res) => {
        setCredential(res?.data);
        setIsLoading(false);
        setIsGenerateCredentialsModalOpen(true);
      });
    } catch (err) {
      setIsLoading(false);
      let reason;
      if (isServiceApiError(err)) {
        reason = err.response?.data.reason;
      }
      // TO DO: Add error - setError(reason);
    }
  };

  const handleGenerateCredentialsModal = () => {
    setIsLoading(true);
    generateCredential();
  };

  return (
    <div className="mas--details__drawer--tab-content">
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_1')}</Text>
        <Text component={TextVariants.h3} className="pf-u-mt-md">
          {t('bootstrap_server')}
        </Text>
        <Text component={TextVariants.small}>{t('bootstrap_server_description')}</Text>
      </TextContent>
      {isKafkaPending ? (
        <Skeleton />
      ) : (
        <ClipboardCopy data-testid="drawerStreams-copyBootstrapURL" textAriaLabel={t('bootstrap_server')}>
          {externalServer}
        </ClipboardCopy>
      )}

      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h3} className="pf-u-mt-md">
          {t('serviceAccount.service_accounts_small')}
        </Text>
        <Text component={TextVariants.small}>
          {t('serviceAccount.create_service_account_to_generate_credentials')}{' '}
          <Button variant={ButtonVariant.link} isSmall isInline>
            {t('serviceAccount.service_accounts')}
          </Button>{' '}
          {t('common.page')}.
        </Text>
      </TextContent>
      <Button
        variant="secondary"
        onClick={handleGenerateCredentialsModal}
        spinnerAriaValueText={isLoading ? 'Loading' : undefined}
        isLoading={isLoading}
        data-testid="drawerStreams-buttonCreateServiceAccount"
        isInline
      >
        {t('serviceAccount.create_service_account')}
      </Button>
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h3} className="pf-u-mt-md">
          {t('common.authentication_method')}
        </Text>
        <Text component={TextVariants.h4} className="pf-u-mt-md">
          {t('common.sasl_oauthbearer')} <Label color="green">{t('common.recommended')}</Label>{' '}
          <Popover
            aria-label={t('common.sasl_oauthbearer')}
            bodyContent={<div>{t('serviceAccount.sasl_oauthbearer_popover_content')}</div>}
          >
            <HelpIcon />
          </Popover>
        </Text>
        <Text component={TextVariants.small}>{t('serviceAccount.sasl_oauthbearer_description')}</Text>
        <Text component={TextVariants.h6} className="pf-u-mt-md">
          {t('common.token_endpoint_url')}
        </Text>
        {isKafkaPending ? <Skeleton /> : <ClipboardCopy>https://:30123</ClipboardCopy>}
      </TextContent>
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.h4} className="pf-u-mt-md">
          {t('common.sasl_plain')}{' '}
          <Popover
            aria-label={t('common.sasl_plain')}
            bodyContent={<div>{t('serviceAccount.sasl_plain_popover_content')}</div>}
          >
            <HelpIcon />
          </Popover>
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
      <MASGenerateCredentialsModal
        isOpen={isGenerateCredentialsModalOpen}
        setIsOpen={setIsGenerateCredentialsModalOpen}
        isLoading={isLoading}
        credential={credential}
        setCredential={setCredential}
      />
    </div>
  );
};
