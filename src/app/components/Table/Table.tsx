import * as React from 'react';
import { Title } from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import { Services } from '../../common/app-config';

type TableProps = {
  kafkaInstanceItems: KafkaRequestAllOf,
  mainToggle: boolean
}

const Table = ({mainToggle, kafkaInstanceItems}: TableProps) => {

  const apisService = Services.getInstance().apiService;

  const onDeleteInstance = async (event) => {
    await apisService.deleteKafkaById("").then(res => {
      console.info("Kafka successfully deleted")
    })
    .catch(error => {
      console.log("Error deleting Kafka")
    })
  }

  return (
    <>
      <Title headingLevel="h1" size="lg">Table goes here</Title>
    </>
  )
}

export { Table };
