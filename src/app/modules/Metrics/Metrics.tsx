import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultApi } from 'src/openapi';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { isServiceApiError } from '@app/utils';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import {
  AvailableDiskSpaceChart,
  Broker,
  LogSizePerPartitionChart,
  IncomingBytesPerTopicChart,
  OutgoingBytesPerTopicChart,
  Topic
} from '@app/modules/Metrics/Charts';
import { 
  AlertVariant,
  Card,
  CardTitle,
  Title,
  TitleSizes,
  CardBody,
  Grid,
  GridItem,
  PageSection
} from '@patternfly/react-core';

export const Metrics = () => {

  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();

  const [globalPartitionCount, setGlobalPartitionCount] = useState<number>(0);
  const [offlinePartitionCount, setOfflinePartitionCount] = useState<number>(0);
  const [brokerAvailableSpace, setBrokerAvailableSpace] = useState<Broker[]>([] as Broker[]);
  const [topicMessageCount, setTopicMessageCount] = useState<Topic[]>([] as Topic[]);

  const instanceDetail = "1qZo2ST6XgUadLImw59RLauEU2h";

  // Functions
  // const fetchInstantMetrics = async () => {
  //   const accessToken = await authContext?.getToken();
  //   if (accessToken !== undefined && accessToken !== '') {
  //     try {
  //       const apisService = new DefaultApi({
  //         accessToken,
  //         basePath
  //       });
  //       if (!instanceDetail || !instanceDetail) {
  //         return;
  //       }
  //       await apisService.getMetricsByInstantQuery(instanceDetail, ['kafka_controller_kafkacontroller_offline_partitions_count', 'kafka_controller_kafkacontroller_global_partition_count']).then((res) => {
  //         const data = res.data;
  //         let globalPartitionCounter = 0, offlinePartitionCounter = 0;
  //         data.items?.forEach(item => {
  //           const labels = item.metric;
  //           if (labels === undefined) {
  //             throw new Error('item.metric cannot be undefined');
  //           }
  //           if (item.values === undefined) {
  //             throw new Error('item.values cannot be undefined');
  //           }
  //           if (labels['__name__'] === 'kafka_controller_kafkacontroller_offline_partitions_count') {
  //             offlinePartitionCounter += item.values[item.values.length - 1].Value;
  //           }
  //           if (labels['__name__'] === 'kafka_controller_kafkacontroller_global_partition_count') {
  //             globalPartitionCounter += item.values[item.values.length - 1].Value;
  //           }
  //         });
  //         setGlobalPartitionCount(globalPartitionCounter);
  //         setOfflinePartitionCount(offlinePartitionCounter);
  //       });
  //     } catch (error) {
  //       let reason: string | undefined;
  //       if (isServiceApiError(error)) {
  //         reason = error.response?.data.reason;
  //       }
  //       /**
  //        * Todo: show user friendly message according to server code
  //        * and translation for specific language
  //        *
  //        */
  //       addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
  //     }
  //   }
  // };
  
    // Functions
    const fetchMetrics = async () => {
      const accessToken = await authContext?.getToken();
      if (accessToken !== undefined && accessToken !== '') {
        try {
          const apisService = new DefaultApi({
            accessToken,
            basePath
          });
          if (!instanceDetail || !instanceDetail) {
            return;
          }
          await apisService.getMetricsByRangeQuery(instanceDetail, 6 * 60, 5 * 60, ['kubelet_volume_stats_available_bytes', 'kafka_server_brokertopicmetrics_messages_in_total']).then((res) => {
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
      // fetchInstantMetrics();
    }, [instanceDetail]);

    const AvailableDiskSpaceChartRender = () => {
      if (brokerAvailableSpace.length > 0) {
        return <AvailableDiskSpaceChart brokers={brokerAvailableSpace} />;
      } else {
        return <></>;
      }
    };
  
    // For when we add messages chart later
    // const ConnectedMessagesChart = () => {
    //   if (topicMessageCount.length > 0) {
    //     return <MessagesChart topics={topicMessageCount} />;
    //   } else {
    //     return <></>;
    //   }
    // };

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <Card>
            <CardTitle>
              {t('metrics.available_disk_space_per_broker')}
            </CardTitle>
            <CardBody>
              <AvailableDiskSpaceChartRender/>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>
              {t('metrics.incoming_bytes_per_topic')}
            </CardTitle>
            <CardBody>
              <IncomingBytesPerTopicChart/>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>
              {t('metrics.outgoing_bytes_per_topic')}
            </CardTitle>
            <CardBody>
              <OutgoingBytesPerTopicChart/>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardTitle>
              {t('metrics.log_size_per_partition')}
            </CardTitle>
            <CardBody>
              <LogSizePerPartitionChart/>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </PageSection>
  );
};
