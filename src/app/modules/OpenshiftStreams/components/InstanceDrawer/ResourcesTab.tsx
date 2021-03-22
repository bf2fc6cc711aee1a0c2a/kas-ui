import React from 'react';
import { TextContent, Text, TextVariants, Flex, FlexItem, ClipboardCopy } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { GenerateCredential } from './GenerateCredential';

export type ResourcesTabProps = {
  mainToggle?: boolean;
  externalServer?: string;
  instanceName?: string;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  mainToggle,
  externalServer,
  instanceName,
}: ResourcesTabProps) => {
  const { t } = useTranslation();

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
        <GenerateCredential instanceName={instanceName} mainToggle={mainToggle} />
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
    </div>
  );
};
