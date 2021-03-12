import React from 'react';
import { TextContent, Text, TextVariants, Button } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export const SampleCodeTab = () => {
  const { t } = useTranslation();
  const editors = [
    { type: 'JAVA', code: 'code goes here' },
    { type: 'MVN', code: 'code goes here' },
    { type: 'CLI', code: 'code goes here' },
    { type: 'CURL', code: 'code goes here' },
  ];

  return (
    <>
      <div className="mas--details__drawer--tab-content">
        <TextContent className="pf-u-pb-sm">
          <Text component={TextVariants.small}>
            Below are example configuration snippets for accessing Service Registry from different runtimes.
          </Text>
        </TextContent>
        {editors?.map(({ type, code }) => (
          <div className="pf-c-code-editor pf-m-read-only">
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
