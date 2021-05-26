import React from 'react';
import { TextContent, Text, TextVariants, ClipboardCopy, Form, FormGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export type ResourcesTabProps = {
  mainToggle?: boolean;
};

export const ResourcesTab: React.FC<ResourcesTabProps> = () => {
  const { t } = useTranslation();
  const registriesInfo = [
    { title: t('serviceRegistry.tab_resources_content_1'), code: 'https://registry.my-domain.com/api' },
    { title: t('serviceRegistry.tab_resources_content_2'), code: 'https://mass-sso.url' },
    { title: t('common.client_key'), code: 'srvc-reg-7f7f8f7f87f-3634-c2e-879877988787' },
    { title: t('common.client_secret'), code: '2d668686876-8768786-8766686-8787jhjh88' },
  ];

  return (
    <div className="mas--details__drawer--tab-content">
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.small}>{t('serviceRegistry.tab_resources_title_info')}</Text>
      </TextContent>
      <Form>
        {registriesInfo?.map(({ title, code }, index) => (
          <FormGroup label={title} fieldId={`copy-clipboard-${index}`} key={`${code}'-'${index}`}>
            <ClipboardCopy
              id={`copy-clipboard-${index}`}
              hoverTip={t('common.copy_clipboard')}
              clickTip={t('common.copy_clipboard_successfully')}
              textAriaLabel={title}
              isReadOnly
            >
              {code}
            </ClipboardCopy>
          </FormGroup>
        ))}
      </Form>
    </div>
  );
};
