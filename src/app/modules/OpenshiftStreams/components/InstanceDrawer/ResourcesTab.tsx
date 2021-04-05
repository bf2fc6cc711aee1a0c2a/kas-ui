import React, { useState, useContext } from 'react';
import { Button, TextContent, Text, TextVariants, Flex, FlexItem, ClipboardCopy } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { MASGenerateCredentialsModal } from '@app/common/MASGenerateCredentialsModal/MASGenerateCredentialsModal';
import { ApiContext } from '@app/api/ApiContext';
import { AuthContext } from '@app/auth/AuthContext';
import { isServiceApiError } from '@app/utils/error';
import { DefaultApi, ServiceAccountRequest } from '../../../../../openapi/api';

export type ResourcesTabProps = {
  mainToggle?: boolean;
  externalServer?: string;
  instanceName?: string;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  mainToggle,
  externalServer,
  instanceName = '',
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
        <Text component={TextVariants.h5}>{t('kafka_listener_and_credentials')}</Text>
        <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_2')}</Text>
        <Text component={TextVariants.p} className="pf-u-mt-md">
          {t('bootstrap_server')}
        </Text>
      </TextContent>
      <Flex>
        <FlexItem className="pf-m-grow pf-m-spacer-none pf-u-mb-xs">
          <ClipboardCopy data-testid="drawerStreams-copyBootstrapURL">{externalServer}</ClipboardCopy>
        </FlexItem>
        <FlexItem className="pf-m-align-right">
          <Button
            variant="secondary"
            onClick={handleGenerateCredentialsModal}
            className="pf-u-ml-md"
            spinnerAriaValueText={isLoading ? 'Loading' : undefined}
            isLoading={isLoading}
            data-testid="drawerStreams-buttonCreateServiceAccount"
          >
            {t('serviceAccount.create_service_account')}
          </Button>
        </FlexItem>
      </Flex>
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
