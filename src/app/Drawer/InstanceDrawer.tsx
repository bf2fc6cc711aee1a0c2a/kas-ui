import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  DataList,
  DataListContent,
  DataListToggle,
  ButtonVariant,
  InputGroup,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarExpandIconWrapper,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { AngleRightIcon, CopyIcon, SearchIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import './InstanceDrawer.css';
import { GenerateCredential } from './GenerateCredential';
import { Loading } from '@app/components/Loading/Loading';
import { ApiContext } from '@app/api/ApiContext';
import { Connector, ConnectorList, ConnectorType, DefaultApi, KafkaRequest } from 'src/openapi';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '@app/auth/AuthContext';

function renderTextListItemDetail(title: string, value?: string) {
  return (
    <>
      {value && (
        <>
          <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
          <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
        </>
      )}
    </>
  );
}

const ConnectorType: React.FunctionComponent<{ connector: Connector }> = ({ connector }) => {
  const { t } = useTranslation();
  const { basePath } = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [{ loading, type }, setType] = useState<{ loading: boolean; type?: ConnectorType }>({
    loading: false,
  });
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetails = () => setShowDetails((v) => !v);

  const loadType = useCallback(
    async (type?: string) => {
      if (type) {
        setType({ loading: true, type: undefined });
        const accessToken = await authContext?.getToken();
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        const res = await apisService.getConnectorTypeByID(type);
        if (res.status === 200) {
          setType({ loading: false, type: res.data });
        } else {
          setType({ loading: false, type: undefined });
        }
      } else {
        setType({ loading: false, type: undefined });
      }
    },
    [authContext, basePath]
  );

  useEffect(() => {
    loadType(connector.connector_type_id);
  }, [connector, loadType]);
  return (
    <DataListItem aria-labelledby="simple-item1" isExpanded={showDetails}>
      <DataListItemRow>
        <DataListToggle onClick={toggleDetails} isExpanded={showDetails} id="ex-toggle1" aria-controls="ex-expand1" />
        <DataListItemCells
          dataListCells={[
            <DataListCell key="secondary content">
              <TextContent>
                <Grid hasGutter>
                  <GridItem span={12}>
                    <Text component={TextVariants.h4}>{connector.metadata?.name}</Text>
                  </GridItem>
                  <GridItem span={2}>
                    <img src="https://placekitten.com/50/50" />
                  </GridItem>
                  <GridItem span={10}>
                    <Text component={TextVariants.h5}>{type?.name}</Text>
                    <Text>{type?.description}</Text>
                  </GridItem>
                </Grid>
              </TextContent>
            </DataListCell>,
            <DataListCell isFilled={false} key="t content">
              {connector.status}
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
      <DataListContent aria-label="Primary Content Details" id="ex-expand1" isHidden={!showDetails}>
        <TextContent>
          <TextList component={TextListVariants.dl}>
            {renderTextListItemDetail(t('status'), connector.status)}
            {renderTextListItemDetail(t('cloud_provider'), connector.deployment_location?.cloud_provider)}
            {renderTextListItemDetail(t('region'), connector.deployment_location?.region)}
            {renderTextListItemDetail(t('id'), connector.id)}
            {renderTextListItemDetail(t('owner'), connector.metadata?.owner)}
            {renderTextListItemDetail(t('created'), dayjs(connector.metadata?.created_at).format('LLLL'))}
            {renderTextListItemDetail(t('updated'), dayjs(connector.metadata?.updated_at).format('LLLL'))}
          </TextList>
        </TextContent>
      </DataListContent>
    </DataListItem>
  );
};

const Connectors: React.FunctionComponent<{ id?: string, createNewConnector: () => void }> = ({ id, createNewConnector }) => {
  const { basePath } = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [{ loading, connectors }, setConnectors] = useState<{ loading: boolean; connectors?: ConnectorList }>({
    loading: false,
  });

  const loadConnectors = useCallback(
    async (instanceId: string) => {
      setConnectors({ loading: true, connectors: undefined });
      const accessToken = await authContext?.getToken();
      const apisService = new DefaultApi({
        accessToken,
        basePath,
      });
      const res = await apisService.listConnectors(instanceId);
      if (res.status === 200) {
        setConnectors({ loading: false, connectors: res.data });
      } else {
        setConnectors({ loading: false, connectors: undefined });
      }
    },
    [authContext, basePath]
  );

  useEffect(() => {
    if (id) {
      loadConnectors(id);
    }
  }, [id, loadConnectors]);

  return (
    <div className="mk--instance-details__drawer--tab-content">
      <TextContent>
        <Text>
          Something meaningful about connectors perhaps? Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Commodi tempora necessitatibus libero consectetur quisquam!
        </Text>
      </TextContent>
      <Toolbar inset={{
          default: 'insetNone',
          md: 'insetSm',
          xl: 'inset2xl',
          '2xl': 'insetLg'
        }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="expand-all" isAllExpanded={false}>
              <Tooltip position="right" content={<div>Expand all rows</div>}>
                <Button variant="plain" aria-label={'Expand all rows'}>
                  <ToolbarExpandIconWrapper>
                    <AngleRightIcon />
                  </ToolbarExpandIconWrapper>
                </Button>
              </Tooltip>
            </ToolbarItem>
            <ToolbarItem>
              <InputGroup>
                <TextInput name="textInput1" id="textInput1" type="search" aria-label="search input example" />
                <Button variant={ButtonVariant.control} aria-label="search button for search input">
                  <SearchIcon />
                </Button>
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="secondary" onClick={createNewConnector}>Create new connector</Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      <br />
      <DataList aria-label="Simple data list example">
        {loading ? <Loading /> : connectors?.items.map((c) => <ConnectorType connector={c} key={c.id} />)}
      </DataList>
    </div>
  );
};

export type InstanceDrawerProps = {
  mainToggle: boolean;
  onClose: () => void;
  onCreateNewConnector: () => void;
  isExpanded: boolean;
  instanceDetail?: KafkaRequest;
  activeTab?: 'Details' | 'Connection';
};
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  mainToggle,
  onClose,
  onCreateNewConnector,
  activeTab,
  instanceDetail,
}) => {
  const { t } = useTranslation();
  const { id, created_at, updated_at, owner } = instanceDetail || {};
  dayjs.extend(localizedFormat);

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

  const externalServer = instanceDetail?.bootstrapServerHost?.endsWith(':443')
    ? instanceDetail?.bootstrapServerHost
    : `${instanceDetail?.bootstrapServerHost}:443`;

  const resourcesTab = (
    <>
      <div className="mk--instance-details__drawer--tab-content">
        <TextContent className="pf-u-pb-sm">
          <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_1')}</Text>
          <Text component={TextVariants.h5}>{t('kafka_listener_and_credentials')}</Text>
          <Text component={TextVariants.small}>{t('drawer_resource_tab_body_description_2')}</Text>
          <Text component={TextVariants.p} className="pf-u-mt-md">
            {t('external_server')}
          </Text>
        </TextContent>
        <Flex>
          <FlexItem className="pf-m-grow pf-m-spacer-none pf-u-mb-xs">
            <ClipboardCopy>{externalServer}</ClipboardCopy>
          </FlexItem>
          <GenerateCredential instanceName={instanceDetail?.name} mainToggle={mainToggle} />
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
    </>
  );

  const sampleCodeTab = (
    <>
      <div className="mk--instance-details__drawer--tab-content">
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

  const detailsTab = (
    <>
      <div className="mk--instance-details__drawer--tab-content">
        {mainToggle && (
          <Grid className="mk--instance-details__drawer--grid">
            <GridItem span={6} className="mk--instance-details__drawer--grid--column-one">
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

  const renderConnectionTab = () => {
    if (mainToggle) {
      return (
        <div className="mk--instance-details__drawer--tab-content pf-m-secondary">
          <Tabs activeKey={activeTab2Key} isSecondary onSelect={handleTab2Click}>
            <Tab eventKey={0} title={<TabTitleText>{t('resources')}</TabTitleText>}>
              {resourcesTab}
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>{t('sample_code')}</TabTitleText>}>
              {sampleCodeTab}
            </Tab>
          </Tabs>
        </div>
      );
    }
    return <>{resourcesTab}</>;
  };

  return (
    <DrawerPanelContent
      data-testid="mk--instance__drawer"
      className="instance-drawer"
      widths={{ default: 'width_50' }}
      hidden={false}
    >
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
              <Tab eventKey={1} title={<TabTitleText>{t('connection')}</TabTitleText>}>
                {renderConnectionTab()}
              </Tab>
              <Tab eventKey={2} title={<TabTitleText>Connectors</TabTitleText>}>
                <Connectors id={instanceDetail?.id} createNewConnector={onCreateNewConnector} />
              </Tab>
            </Tabs>
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );
};

export { InstanceDrawer };
