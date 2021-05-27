import React from 'react';
import { TextContent, Text, TextVariants, Button } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export const SampleCodeTab: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const editors = [
    { type: t('common.java'), code: 'code goes here' },
    { type: t('common.mvn'), code: 'code goes here' },
    { type: t('common.cli'), code: 'code goes here' },
    { type: t('common.curl'), code: 'code goes here' },
  ];

  return (
    <>
      <div className="mas--details__drawer--tab-content">
        <TextContent className="pf-u-pb-sm">
          <Text component={TextVariants.small}>{t('serviceRegistry.tab_sample_code_title_info')}</Text>
        </TextContent>
        {editors?.map(({ type, code }) => (
          <div className="pf-c-code-editor pf-m-read-only" key={type}>
            <div className="pf-c-code-editor__header pf-u-pt-lg">
              <div className="pf-c-code-editor__controls">
                <Button variant="control" aria-label="Action">
                  <CopyIcon />
                </Button>
              </div>
              <div className="pf-c-code-editor__tab">
                <span className="pf-c-code-editor__tab-text">{type}</span>
              </div>
            </div>
            <div className="pf-c-code-editor__main">
              <div className="pf-c-code-editor__code">
                <pre className="pf-c-code-editor__code-pre">{code}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
