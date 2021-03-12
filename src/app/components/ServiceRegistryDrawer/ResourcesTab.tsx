import React from 'react';
import { TextContent, Text, TextVariants, ClipboardCopy } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export type ResourcesTabProps = {
  mainToggle?: boolean;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ mainToggle }: ResourcesTabProps) => {
  const { t } = useTranslation();

  return (
    <div className="mas--details__drawer--tab-content">
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.p}>
          To connect an application or tool to this service registry, you will need the infomration below.
        </Text>
      </TextContent>
      <TextContent className="pf-u-pb-sm pf-u-pt-lg">
        <Text component={TextVariants.h4}>Registry REST API URL</Text>
      </TextContent>
      <ClipboardCopy>https://registry.my-domain.com/api</ClipboardCopy>
      <TextContent className="pf-u-pb-sm pf-u-pt-lg">
        <Text component={TextVariants.h4}>MAS-SSO Instance URL</Text>
      </TextContent>
      <ClipboardCopy>https://mass-sso.url</ClipboardCopy>
      <TextContent className="pf-u-pb-sm pf-u-pt-lg">
        <Text component={TextVariants.h4}>Client Key</Text>
      </TextContent>
      <ClipboardCopy>srvc-reg-7f7f8f7f87f-3634-c2e-879877988787</ClipboardCopy>
      <TextContent className="pf-u-pb-sm pf-u-pt-lg">
        <Text component={TextVariants.h4}>Client Secret</Text>
      </TextContent>
      <ClipboardCopy>2d668686876-8768786-8766686-8787jhjh88</ClipboardCopy>
    </div>
  );
};
