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
  const [brokerAvailableSpace, setBrokerAvailableSpace] = useState<Broker[]>([]);
  const [topicMessageCount, setTopicMessageCount] = useState<Topic[]>([] as Topic[]);

  const instanceDetail = "1qwYPIV2YFiuTEF5c100IwmsLZ0";

  console.log('what is brokerAvailableSpace' + brokerAvailableSpace);

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

  const returnAvailableBytesData = (data) => {
    let brokerArray = [];
    data.forEach((datum, i) => {
      const labels = datum.metric;
      const pvcName = labels['persistentvolumeclaim'];
      if (!pvcName.includes('zookeeper')) {
        const broker = {
          name: `broker ${i}`,
          data: []
        } as Broker;
        datum.values?.forEach(value => {
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
        brokerArray.push(broker);
      }})
      setBrokerAvailableSpace(brokerArray);
    }

  const returnBrokerTopicMetricsMessagesInTotal = (data, i) => {
    const labels = data.metric;
    const name = labels['topic'];
    if (name !== '__consumer_offsets' && name !== 'strimzi-canary') {
      let topic = {
        name,
        data: []
      } as Topic;

      data.values.forEach(value => {
        if (value.Timestamp == undefined) {
          throw new Error('timestamp cannot be undefined');
        }
        topic.data.push({
          count: value.Value,
          timestamp: value.Timestamp
        });
      });
      setTopicMessageCount(topic);
    }
  }

  const returnBrokerTopicMetricsBytesInTotal = (data, i) => {
    console.log('what is data heree' + JSON.stringify(data));

    // let bytes = {
    //   name,
    //   data: []
    // } as Topic;

    // data.items.forEach(item => {
    //   let values = item.values;
    //   if (values.Timestamp == undefined) {
    //     throw new Error('timestamp cannot be undefined');
    //   }

    // }

    // bytes.data.push({
    //   timestamp: 
    // })

  }
  
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
          await apisService.getMetricsByRangeQuery(instanceDetail, 6 * 60, 5 * 60, ['kubelet_volume_stats_available_bytes', 'kafka_server_brokertopicmetrics_messages_in_total', 'kafka_server_brokertopicmetrics_bytes_in_total']).then((res) => {
            console.log('what is data' + JSON.stringify(res.data));
            const data = res.data;
            let availableBytesData = [];
            data.items?.forEach((item, i) => {
              const labels = item.metric;
              if (labels === undefined) {
                throw new Error('item.metric cannot be undefined');
              }
              if (item.values === undefined) {
                throw new Error('item.values cannot be undefined');
              }
              if (labels['__name__'] === 'kubelet_volume_stats_available_bytes') {
                availableBytesData.push(item);
              }
              if (labels['__name__'] === 'kafka_server_brokertopicmetrics_messages_in_total') {
                returnBrokerTopicMetricsMessagesInTotal(item, i);
              }
              if(labels['__name__'] === 'kafka_server_brokertopicmetrics_bytes_in_total') {
                returnBrokerTopicMetricsBytesInTotal(item, i);
              }
            });
            returnAvailableBytesData(availableBytesData);
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
    }, []);
  
    // For when we add messages chart later
    // const ConnectedMessagesChart = () => {
    //   if (topicMessageCount.length > 0) {
    //     return <MessagesChart topics={topicMessageCount} />;
    //   } else {
    //     return <></>;
    //   }
    // };

    console.log('what is brokerAvailableSpace' + JSON.stringify(brokerAvailableSpace));

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem>
          <Card>
            <CardTitle>
              {t('metrics.available_disk_space_per_broker')}
            </CardTitle>
            <CardBody>
              { brokerAvailableSpace.length > 0 && <AvailableDiskSpaceChart brokers={brokerAvailableSpace} />}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card>
            <CardTitle>
              {t('metrics.incoming_bytes_per_topic')}
            </CardTitle>
            <CardBody>
              {/* <IncomingBytesPerTopicChart/> */}
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
