import * as React from 'react';
import { Title } from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';

type TableProps = {
  kafkaInstanceItems: KafkaRequestAllOf,
  mainToggle: boolean
}

const Table = ({mainToggle, kafkaInstanceItems}: TableProps) => {
  return (
    <>
      <Title headingLevel="h1" size="lg">Table goes here</Title>
    </>
  )
}

export { Table };
