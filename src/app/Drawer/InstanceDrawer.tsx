import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  ClipboardCopy,
  DrawerPanelContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerActions,
  DrawerCloseButton,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
  TextVariants,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import './InstanceDrawer.css';
import { GenerateCredential } from './GenerateCredential';
import { Loading } from '@app/components/Loading/Loading';
import { KafkaRequest } from 'src/openapi';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';

export type InstanceDrawerProps = {
  mainToggle: boolean;
  onClose: () => void;
  isExpanded: boolean;
  drawerRef: any;
  instanceDetail?: KafkaRequest;
  activeTab?: 'Details' | 'Connection';
};
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  mainToggle,
  onClose,
  activeTab,
  instanceDetail,
}) => {
  const {t} = useTranslation();
  const [activeTab1Key, setActiveTab1Key] = useState(0);
  const [activeTab2Key, setActiveTab2Key] = useState(0);
  useEffect(() => {
    setActiveTab1Key(activeTab === 'Details' ? 0 : 1);
  }, [activeTab]);

  const handleTab1Click = (_event, tabIndex) => {
    setActiveTab1Key(tabIndex);
  };

  const handleTab2Click = (_event, tabIndex) => {
    setActiveTab2Key(tabIndex);
  };

  const resourcesTab = (
    <>
      <div className="tab-content-body">
        <TextContent className="pf-u-pb-sm">
          <Text component={TextVariants.small}>
            {t('drawer_resource_tab_body_description_1')}
          </Text>
          <Text component={TextVariants.h5}>{t('kafka_listener_and_credentials')}</Text>
          <Text component={TextVariants.small}>
            {t('drawer_resource_tab_body_description_2')}
          </Text>
          <Text component={TextVariants.p} className="pf-u-mt-md">
            {t('external_server')}
          </Text>
        </TextContent>
        <Flex>
          <FlexItem className="pf-m-grow pf-m-spacer-none pf-u-mb-xs">
            <ClipboardCopy>strimzi-external-bootstrap-01:1234</ClipboardCopy>
          </FlexItem>
          <GenerateCredential />
        </Flex>
        <TextContent className="pf-u-pb-sm pf-u-pt-lg">
          <Text component={TextVariants.h5}>Producer endpoint and credentials</Text>
          <Text component={TextVariants.small}>
            {t('drawer_resource_tab_body_description_3')}
          </Text>
        </TextContent>
        <ClipboardCopy>https: // : 30123</ClipboardCopy>
      </div>
    </>
  );

  const sampleCodeTab = (
    <>
      <div className="tab-content-body">
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

  const renderTextListItemDetail = (title: string, value?: string) => (
    <>
      {value && (
        <>
          <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
        </>
      )}
    </>
  );

  const { id, created_at, updated_at, owner } = instanceDetail || {};
  dayjs.extend(localizedFormat);

  const detailsTab = (
    <>
      <div className="tab-content-body">
        {mainToggle && (
          <Grid className="instance-card-grid">
            <GridItem span={6} className="instance-detail-first-grid">
              <Card isFlat>
                <CardBody>
                  <TextContent>
                    <Text component={TextVariants.small} className="pf-u-mb-0">
                      {t('topics')}
                    </Text>
                    <Text component={TextVariants.h3} className="pf-u-mt-0">
                      10
                    </Text>
                  </TextContent>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem span={6}>
              <Card isFlat>
                <CardBody>
                  <TextContent>
                    <Text component={TextVariants.small} className="pf-u-mb-0">
                      {t('consumer_groups')}
                    </Text>
                    <Text component={TextVariants.h3} className="pf-u-mt-0">
                      8
                    </Text>
                  </TextContent>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}
        <TextContent>
          <TextList component={TextListVariants.dl}>
            {renderTextListItemDetail(t('cloud_provider'), t('amazon_web_services'))}
            {renderTextListItemDetail(t('region'), t('us_east_north_virginia'))}
            {renderTextListItemDetail(t('id'), id)}
            {renderTextListItemDetail(t('owner'), owner)}
            {renderTextListItemDetail(t('created'), dayjs(created_at).format('LLLL'))}
            {renderTextListItemDetail(t('updated'), dayjs(updated_at).format('LLLL'))}
          </TextList>
        </TextContent>
      </div>
    </>
  );

  const connectionTab = (
    <>
      <div className="tab-content-body pf-m-secondary">
        <Tabs activeKey={activeTab2Key} isSecondary onSelect={handleTab2Click}>
          <Tab eventKey={0} title={<TabTitleText>{t('resources')}</TabTitleText>}>
            {resourcesTab}
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>{t('sample_code')}</TabTitleText>}>
            {sampleCodeTab}
          </Tab>
        </Tabs>
      </div>
    </>
  );

  return (
    <DrawerPanelContent className="instance-drawer" widths={{ default: 'width_50' }}>
      {instanceDetail === undefined ? (
        <Loading />
      ) : (
        <>
          <DrawerHead>
            <TextContent>
              <Text component={TextVariants.small} className="pf-u-mb-0">
                {t('instance_name')}
              </Text>
              <Title headingLevel="h1" size={TitleSizes['xl']} className="pf-u-mt-0 ">
                {instanceDetail?.name}
              </Title>
            </TextContent>
            <DrawerActions>
              <DrawerCloseButton onClick={onClose} />
            </DrawerActions>
          </DrawerHead>
          <DrawerPanelBody>
            <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
              <Tab eventKey={0} title={<TabTitleText>{t('details')}</TabTitleText>}>
                {detailsTab}
              </Tab>
              {mainToggle && (
                <Tab eventKey={1} title={<TabTitleText>{t('connection')}</TabTitleText>}>
                  {connectionTab}
                </Tab>
              )}
            </Tabs>
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );
};

export { InstanceDrawer };
