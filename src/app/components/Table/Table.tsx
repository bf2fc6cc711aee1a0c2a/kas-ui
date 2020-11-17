import * as React from 'react';
import { Title } from '@patternfly/react-core';
import { KafkaInstance } from '../../models/models';

type TableProps = {
  kafkaInstanceItems: KafkaInstance;
}

const Table = ({kafkaInstanceItems}: TableProps) => {
  return (
    <>
      <Title headingLevel="h1" size="lg">Table goes here</Title>
    </>
  )
}

export { Table };
