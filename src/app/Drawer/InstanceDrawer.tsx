import React, { useContext, useEffect, useState } from 'react';
import {
  AlertVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  ClipboardCopy,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  Title,
  TitleSizes
} from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import './InstanceDrawer.css';
import { GenerateCredential } from './GenerateCredential';
import { Loading } from '@app/components/Loading/Loading';
import { DefaultApi, KafkaRequest } from 'src/openapi';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { AvailableDiskSpaceChart, Broker } from '@app/Drawer/AvailableDiskSpaceChart';
import { MessagesChart, Topic } from '@app/Drawer/MessagesChart';

export type InstanceDrawerProps = {
  mainToggle: boolean;
  onClose: () => void;
  isExpanded: boolean;
  instanceDetail?: KafkaRequest;
  activeTab?: 'Details' | 'Connection';
};
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
                                                                        mainToggle,
                                                                        onClose,
                                                                        activeTab,
                                                                        instanceDetail
                                                                      }) => {
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();
  const { t } = useTranslation();

  const [globalPartitionCount, setGlobalPartitionCount] = useState<number>(0);
  const [offlinePartitionCount, setOfflinePartitionCount] = useState<number>(0);
  const [brokerAvailableSpace, setBrokerAvailableSpace] = useState<Broker[]>([] as Broker[]);
  const [topicMessageCount, setTopicMessageCount] = useState<Topic[]>([] as Topic[]);

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

  // Functions
  const fetchInstantMetrics = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath
        });
        if (!instanceDetail || !instanceDetail.id) {
          return;
        }
        await apisService.getMetricsByKafkaId(instanceDetail.id, 1, 5, ['kafka_controller_kafkacontroller_offline_partitions_count', 'kafka_controller_kafkacontroller_global_partition_count']).then((res) => {
          const data = res.data;
          let globalPartitionCounter = 0, offlinePartitionCounter = 0;
          data.items?.forEach(item => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }
            if (labels['__name__'] === 'kafka_controller_kafkacontroller_offline_partitions_count') {
              offlinePartitionCounter += item.values[item.values.length - 1].Value;
            }
            if (labels['__name__'] === 'kafka_controller_kafkacontroller_global_partition_count') {
              globalPartitionCounter += item.values[item.values.length - 1].Value;
            }
          });
          setGlobalPartitionCount(globalPartitionCounter);
          setOfflinePartitionCount(offlinePartitionCounter);
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        /**
         * Todo: show user friendly message according to server code
         * and translation for specific language
         *
         */
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  };

  // Functions
  const fetchMetrics = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath
        });
        if (!instanceDetail || !instanceDetail.id) {
          return;
        }
        await apisService.getMetricsByKafkaId(instanceDetail.id, 6 * 60, 5 * 60, ['kubelet_volume_stats_available_bytes', 'kafka_server_brokertopicmetrics_messages_in_total']).then((res) => {
          const data = res.data;
          const brokers = [] as Broker[];
          const topics = [] as Topic[];
          data.items?.forEach((item, i) => {
            const labels = item.metric;
            if (labels === undefined) {
              throw new Error('item.metric cannot be undefined');
            }
            if (item.values === undefined) {
              throw new Error('item.values cannot be undefined');
            }
            if (labels['__name__'] === 'kubelet_volume_stats_available_bytes') {
              const pvcName = labels['persistentvolumeclaim'];
              if (!pvcName.includes('zookeeper')) {
                const broker = {
                  name: `broker ${i}`,
                  data: []
                } as Broker;
                item.values?.forEach(value => {
                  if (value.Timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  const hardLimit = 225 * 1024 * 1024 * 1024 * .95;
                  const usedSpaceInBytes = hardLimit - value.Value;
                  const softLimit = 225 * 1024 * 1024 * 1024 * .90;
                  broker.data.push({
                    timestamp: value.Timestamp,
                    usedSpace: usedSpaceInBytes,
                    hardLimit,
                    softLimit
                  });
                });
                brokers.push(broker);
              }
            }
            if (labels['__name__'] === 'kafka_server_brokertopicmetrics_messages_in_total') {
              const name = labels['topic'];
              if (name !== '__consumer_offsets' && name !== 'strimzi-canary') {
                let topic = {
                  name,
                  data: []
                } as Topic;

                item.values.forEach(value => {
                  if (value.Timestamp == undefined) {
                    throw new Error('timestamp cannot be undefined');
                  }
                  topic.data.push({
                    count: value.Value,
                    timestamp: value.Timestamp
                  });
                });
                topics.push(topic);
              }
            }
          });
          setTopicMessageCount(topics);
          setBrokerAvailableSpace(brokers);
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        /**
         * Todo: show user friendly message according to server code
         * and translation for specific language
         *
         */
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchInstantMetrics();
  }, [instanceDetail?.id]);

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

  const AvailableSpaceChart = () => {
    if (brokerAvailableSpace.length > 0) {
      return <AvailableDiskSpaceChart brokers={brokerAvailableSpace} />;
    } else {
      return <></>;
    }
  };

  const ConnectedMessagesChart = () => {
    if (topicMessageCount.length > 0) {
      return <MessagesChart topics={topicMessageCount} />;
    } else {
      return <></>;
    }
  };

  const detailsTab = (
    <>
      <div className="mk--instance-details__drawer--tab-content">
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
          <GridItem span={6} className="mk--instance-details__drawer--grid--column-one pf-u-mt-sm">
            <Card isFlat>
              <CardHeader>
                <TextContent>
                  <Text component={TextVariants.small} className="pf-u-mb-0">
                    {t('topic_partitions')}
                  </Text>
                </TextContent>
              </CardHeader>
              <CardBody>
                <Grid>
                  <GridItem span={6}>
                    <Text component={TextVariants.small} className="pf-u-mb-0">
                      {t('topic_partitions_online')}
                    </Text>
                  </GridItem>
                  <GridItem span={6}>
                    <Text component={TextVariants.h3} className="pf-u-mt-0">
                      {globalPartitionCount - offlinePartitionCount}
                    </Text>
                  </GridItem>
                  <GridItem span={6}>
                    <Text component={TextVariants.small} className="pf-u-mb-0">
                      {t('topic_partitions_offline')}
                    </Text>
                  </GridItem>
                  <GridItem span={6}>
                    <Text component={TextVariants.h3} className="pf-u-mt-0">
                      {offlinePartitionCount}
                    </Text>
                  </GridItem>
                </Grid>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
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
        <AvailableSpaceChart />
        <ConnectedMessagesChart />
      </div>
    </>
  );

  const renderConnectionTab = () => {
    if (mainToggle) {
      return (
        <div className="mk--instance-details__drawer--tab-content pf-m-secondary">
          <Tabs
            activeKey={activeTab2Key}
            isSecondary
            onSelect={handleTab2Click}
          >
            <Tab
              eventKey={0}
              title={<TabTitleText>{t('resources')}</TabTitleText>}
            >
              {resourcesTab}
            </Tab>
            <Tab
              eventKey={1}
              title={<TabTitleText>{t('sample_code')}</TabTitleText>}
            >
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
            </Tabs>
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );
};

export { InstanceDrawer };
