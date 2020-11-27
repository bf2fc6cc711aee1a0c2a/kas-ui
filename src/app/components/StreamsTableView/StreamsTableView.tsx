import React, { useContext } from 'react';
import { Table, TableHeader, TableBody, IRowData } from '@patternfly/react-table';
import { Card } from '@patternfly/react-core';
import { DefaultApi, KafkaRequest, KafkaRequestAllOf } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { BASE_PATH, Services } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { useHistory } from 'react-router';
import { AuthContext } from '@app/auth/AuthContext';

type TableProps = {
  kafkaInstanceItems: KafkaRequestAllOf[];
  mainToggle: boolean;
  onConnectToInstance: (data: KafkaRequest) => void;
};

const StreamsTableView = ({ mainToggle, kafkaInstanceItems, onConnectToInstance }: TableProps) => {
  const tableColumns = ['Name', 'Cloud provider', 'Region', 'Status'];

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequest) => void, onConnect: (data: KafkaRequest) => void) => {
    const { originalData } = rowData;
    const title = originalData?.status === InstanceStatus.ACCEPTED ? 'Cancel instance' : 'Delete instance';
    return [
      {
        title,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
      {
        title: 'Connect to instance',
        id: 'connect-instance',
        onClick: () => onConnect(originalData)
      }
    ];
  };

  const preparedTableCells = () => {
    const tableRow: IRowData = [];
    kafkaInstanceItems.forEach((row: IRowData) => {
      const { name, cloud_provider, region, status } = row;
      const cloudProviderDisplayName = getCloudProviderDisplayName(cloud_provider);
      const regionDisplayName = getCloudRegionDisplayName(region);
      tableRow.push({
        cells: [
          name,
          cloudProviderDisplayName,
          regionDisplayName,
          {
            title: <StatusColumn status={status} />,
          },
        ],
        originalData: row,
      });
    });
    return tableRow;
  };

  const actionResolver = (rowData: IRowData) => {
    return getActionResolver(rowData, onDeleteInstance, onConnectToInstance);
  };

  const { token } = useContext(AuthContext);

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH
  });

  const onDeleteInstance = async (event: KafkaRequest) => {
    if (event.id === undefined) {
      throw new Error("kafka id is not set")
    }
    try {
      await apisService.deleteKafkaById(event.id)
      .then((res) => {
        console.info('Kafka successfully deleted');
      })
    } catch(error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <Table
        cells={tableColumns}
        rows={preparedTableCells()}
        aria-label="cluster instance list"
        actionResolver={actionResolver}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </Card>
  );
};

export { StreamsTableView };
