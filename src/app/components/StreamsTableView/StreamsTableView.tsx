import React from 'react';
import { Table, TableHeader, TableBody, IRowData } from '@patternfly/react-table';
import { Card } from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { Services } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';

type TableProps = {
  kafkaInstanceItems: KafkaRequestAllOf[];
  mainToggle: boolean;
};

const StreamsTableView = ({ mainToggle, kafkaInstanceItems }: TableProps) => {
  const tableColumns = ['Name', 'Cloud provider', 'Region', 'Status'];

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequestAllOf) => void) => {
    const { originalData } = rowData;
    const title = originalData?.status === InstanceStatus.ACCEPTED ? 'Cancel instance' : 'Delete instance';
    return [
      {
        title,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
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
    return getActionResolver(rowData, onDeleteInstance);
  };

  const apisService = Services.getInstance().apiService;

  const onDeleteInstance = async (event) => {
    try {
      await apisService.deleteKafkaById('')
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
