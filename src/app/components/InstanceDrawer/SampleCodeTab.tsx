import React from 'react';
import { TextContent, Text, TextVariants, Button } from '@patternfly/react-core';
import CopyIcon from '@patternfly/react-icons/dist/js/icons/copy-icon';
import { useTranslation } from 'react-i18next';

export const SampleCodeTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mas--details__drawer--tab-content">
        <TextContent className="pf-u-pb-sm">
          <Text component={TextVariants.h5}>{t('sample_connection_code')}</Text>
          <Text component={TextVariants.small}>
            {t('drawer_code_section_tab_body_description_1')}
            &lt;{t('brackets')}&gt;.
          </Text>
        </TextContent>
        <div className="pf-c-code-editor pf-m-read-only">
          <div className="pf-c-code-editor__header">
            <div className="pf-c-code-editor__controls">
              <Button variant="control" aria-label="Action">
                <CopyIcon />
              </Button>
            </div>
            <div className="pf-c-code-editor__tab">
              <span className="pf-c-code-editor__tab-text">Java</span>
            </div>
          </div>
          <div className="pf-c-code-editor__main">
            <div className="pf-c-code-editor__code">
              <pre className="pf-c-code-editor__code-pre">import java.util.Properties;</pre>
            </div>
          </div>
        </div>

        <TextContent className="pf-u-pb-sm pf-u-pt-lg">
          <Text component={TextVariants.h5}>{t('sample_connection_code')}</Text>
          <Text component={TextVariants.small}>
            {t('drawer_code_section_tab_body_description_1')}
            &lt;{t('brackets')}&gt;.
          </Text>
        </TextContent>
        <div className="pf-c-code-editor pf-m-read-only">
          <div className="pf-c-code-editor__header">
            <div className="pf-c-code-editor__controls">
              <Button variant="control" aria-label="Action">
                <CopyIcon />
              </Button>
            </div>
          </div>
          <div className="pf-c-code-editor__main">
            <div className="pf-c-code-editor__code">
              <pre className="pf-c-code-editor__code-pre">
                bootstrap.servers=es-1-4-0-ibm-es-proxy-route-bootstrap-es.apps.2019-4-1-demo-icp-mst.fyre.ibm.com:44
                sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username=“token
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
