import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  ClipboardCopy,
  DrawerPanelContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerActions,
  DrawerCloseButton,
  Flex,
  FlexItem,
  FormGroup,
  Grid,
  GridItem,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
  TextInput,
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
import { Loading } from '@app/components/Loading';
import { KafkaRequest } from 'src/openapi';

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
      <TextContent className="pf-u-pb-lg pf-u-pt-lg">
        <Text component={TextVariants.small}>
          To connect an application or tool to this Kafka instance, you will need the address of a Kafka listener, and
          generated credentials.
        </Text>
        <Text component={TextVariants.h5}>Kafka listener and credentials</Text>
        <Text component={TextVariants.small}>
          Your application or tool will make its initial connection to the Kafka instance using the bootstrap server,
          and authenticate with credentials specific to the server if required.
        </Text>
        <Text component={TextVariants.p} className="pf-u-mt-md">
          External server
        </Text>
      </TextContent>
      <Flex>
        <FlexItem className="pf-m-grow pf-m-spacer-none pf-u-mb-xs">
          <ClipboardCopy>strimzi-external-bootstrap-01 : 1234</ClipboardCopy>
        </FlexItem>
        <GenerateCredential />
      </Flex>
      <TextContent className="pf-u-pb-lg pf-u-pt-lg">
        <Text component={TextVariants.h5}>Producer endpoint and credentials</Text>
        <Text component={TextVariants.small}>
          Applications and tools that use the REST producer API will need the REST producer endpoint to connect.
        </Text>
      </TextContent>
      <ClipboardCopy>https : // : 30123</ClipboardCopy>
    </>
  );

  const sampleCodeTab = (
    <>
      <TextContent className="pf-u-pb-lg pf-u-pt-lg">
        <Text component={TextVariants.h5}>Sample connection code</Text>
        <Text component={TextVariants.small}>
          Use this snippet of code to set the properties in your Kafka client to connect securely. Replace the values in
          &lt;brackets&gt;.
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

      <TextContent className="pf-u-pb-lg pf-u-pt-lg">
        <Text component={TextVariants.h5}>Sample connection code</Text>
        <Text component={TextVariants.small}>
          Use this snippet of code to set the properties in your Kafka client to connect securely. Replace the values in
          &lt;brackets&gt;.
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

  const detailsTab = (
    <>
      {mainToggle && (
        <Grid className="instance-card-grid">
          <GridItem span={6} className="instance-detail-first-grid">
            <Card>
              <CardBody>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-u-mb-0">
                    Topics
                  </Text>
                  <Text component={TextVariants.h3} className="pf-u-mt-0">
                    10
                  </Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card>
              <CardBody>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-u-mb-0">
                    Consumer groups
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
      <TextContent className="pf-u-mt-lg">
        <TextList component={TextListVariants.dl}>
          {renderTextListItemDetail('Cloud Provider', 'Amazon Web Services')}
          {renderTextListItemDetail('Region', 'US East, N. Virginia')}
          {renderTextListItemDetail('ID', id)}
          {renderTextListItemDetail('Owner', owner)}
          {renderTextListItemDetail('Created', created_at)}
          {renderTextListItemDetail('Updated', updated_at)}
        </TextList>
      </TextContent>
    </>
  );

  const connectionTab = (
    <>
      <Tabs activeKey={activeTab2Key} isSecondary onSelect={handleTab2Click}>
        <Tab eventKey={0} title={<TabTitleText>Resources</TabTitleText>}>
          {resourcesTab}
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Sample code</TabTitleText>}>
          {sampleCodeTab}
        </Tab>
      </Tabs>
    </>
  );

  return (
    <DrawerPanelContent className="instance-drawer" widths={{ default: 'width_66' }}>
      {instanceDetail === undefined ? (
        <Loading />
      ) : (
        <>
          <DrawerHead>
            <TextContent>
              <Text component={TextVariants.small} className="pf-u-mb-0">
                Instance Name
              </Text>
              <Title headingLevel="h3" size={TitleSizes['2xl']} className="pf-u-mt-0 ">
                {instanceDetail?.name}
              </Title>
            </TextContent>
            <DrawerActions>
              <DrawerCloseButton onClick={onClose} />
            </DrawerActions>
          </DrawerHead>
          <DrawerPanelBody>
            <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
              <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
                {detailsTab}
              </Tab>
              {mainToggle && (
                <Tab eventKey={1} title={<TabTitleText>Connection</TabTitleText>}>
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
