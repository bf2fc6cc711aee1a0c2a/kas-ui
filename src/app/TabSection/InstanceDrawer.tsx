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
  Title,
  TitleSizes,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import './InstanceDrawer.css';
import { GenerateCredential } from './GenerateCredential';
import { Loading } from '@app/components/Loading';
import { KafkaRequest } from 'src/openapi';

export type InstanceDrawerProps = {
  onClose: () => void;
  isExpanded: boolean;
  drawerRef: any;
  instanceDetail?: KafkaRequest;
  activeTab?: 'Details' | 'Connection';
};
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  onClose,
  drawerRef,
  activeTab,
  isExpanded,
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
      <TextContent className="pf-u-pb-sm">
        <Text component={TextVariants.small}>
          To connect an application or tool to this Kafka instance, you will need the address of a Kafka listener, a
          certificate to authenticate with, and generated credentials.
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
      <TextContent>
        <Text component={TextVariants.h5}>Certificates</Text>
        <Text component={TextVariants.small}>
          A certificate is required by your Kafka clients to connect securely to this Kafka instance.
        </Text>
        <Grid hasGutter>
          <GridItem span={6}>
            <Card isFlat isCompact className="card-certificate">
              <CardHeader>
                <CardTitle className="pf-u-pt-0">PKCS12 certificate</CardTitle>
              </CardHeader>
              <CardBody>Use this for a Java client.</CardBody>
              <CardBody>
                <FormGroup label="Certificate password" fieldId="cert-password">
                  <TextInput type="password" id="cert-password" name="cert-password" />
                </FormGroup>
              </CardBody>
              <CardFooter className="pf-u-text-align-right">
                <Button variant="primary">Download certificate</Button>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card isFlat isCompact className="card-certificate pf-u-h-100">
              <CardHeader>
                <CardTitle className="pf-u-pt-0">PEM certificate</CardTitle>
              </CardHeader>
              <CardBody>Use this for anything else.</CardBody>
              <CardFooter className="pf-u-text-align-right">
                <Button variant="primary">Download certificate</Button>
              </CardFooter>
            </Card>
          </GridItem>
        </Grid>
        <Text component={TextVariants.h5}>Producer endpoint and credentials</Text>
        <Text component={TextVariants.small}>
          Applications and tools that use the REST producer API will need the REST producer endpoint to connect.
        </Text>
        <ClipboardCopy>https : // : 30123</ClipboardCopy>
      </TextContent>
    </>
  );

  const sampleCodeTab = (
    <>
      <TextContent className="pf-u-pb-sm">
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

      <TextContent className="pf-u-pb-sm">
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

  const renderGridItemDetail = (title: string, value?: string) => (
    <>
      {value && (
        <>
          <GridItem span={3}>
            <Text component={TextVariants.h5}>
              <b>{title}</b>
            </Text>
          </GridItem>
          <GridItem span={9}>{value}</GridItem>
        </>
      )}
    </>
  );

  const { id, created_at, updated_at, owner } = instanceDetail || {};

  const detailsTab = (
    <>
      <Grid className="instance-card-grid">
        <GridItem span={6} className="instance-detail-first-grid">
          <Card>
            <CardBody>
              <Text component={TextVariants.p}>Topics</Text>
              <b>10</b>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={6}>
          <Card>
            <CardBody>
              <Text>Consumer groups</Text>
              <b>8</b>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      <Grid>
        {renderGridItemDetail('Cloud Provider', 'Amazon Web Services')}
        {renderGridItemDetail('Region', 'US East, N. Virginia')}
        {renderGridItemDetail('ID', id)}
        {renderGridItemDetail('Owner', owner)}
        {renderGridItemDetail('Created', created_at)}
        {renderGridItemDetail('Updated', updated_at)}
      </Grid>
    </>
  );

  const connectionTab = (
    <>
      <br />
      <Tabs activeKey={activeTab2Key} onSelect={handleTab2Click}>
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
    <DrawerPanelContent className="instance-drawer" widths={{ default: 'width_50' }}>
      {instanceDetail === undefined ? (
        <Loading />
      ) : (
        <>
          <DrawerHead>
            Instance Name
            <Title size={TitleSizes.lg} headingLevel="h2" tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
              {instanceDetail?.name}
            </Title>
            <DrawerActions>
              <DrawerCloseButton onClick={onClose} />
            </DrawerActions>
          </DrawerHead>
          <DrawerPanelBody>
            <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
              <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
                {detailsTab}
              </Tab>
              <Tab eventKey={1} title={<TabTitleText>Connection</TabTitleText>}>
                {connectionTab}
              </Tab>
            </Tabs>
            <br />
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );
};

export { InstanceDrawer };
