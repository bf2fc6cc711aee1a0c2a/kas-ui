import React, { useState } from 'react';
import { Table, TableHeader, TableBody, IRow } from '@patternfly/react-table';
import { Card, AlertVariant } from '@patternfly/react-core';
import { KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { Services } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { useAlerts } from '@app/components/Alerts/Alerts';

type TableProps = {
  kafkaInstanceItems: KafkaRequest[];
  mainToggle: boolean;
  refresh: () => void;
};

export const getDeleteInstanceLabel = (status: InstanceStatus) => {
  switch (status) {
    case InstanceStatus.COMPLETED:
      return 'Delete instance';
    case InstanceStatus.FAILED:
      return 'Remove';
    case InstanceStatus.ACCEPTED:
    case InstanceStatus.PROVISIONING:
      return 'Stop instance';
    default:
      return;
  }
};

export const getDeleteInstanceModalConfig = (status: string | undefined, instanceName: string | undefined) => {
  const config = {
    title: '',
    confirmActionLabel: '',
    description: '',
  };
  if (status === InstanceStatus.COMPLETED) {
    config.title = 'Delete instance?';
    config.confirmActionLabel = 'Delete instance';
    config.description = `The ${instanceName} will be deleted.`;
  } else if (status === InstanceStatus.ACCEPTED || status === InstanceStatus.PROVISIONING) {
    config.title = 'Stop creating instance?';
    config.confirmActionLabel = 'Stop creating instance';
    config.description = `The creation of the ${instanceName} instance will be stopped.`;
  }
  return config;
};

const StreamsTableView = ({ mainToggle, kafkaInstanceItems, refresh }: TableProps) => {
  const apisService = Services.getInstance().apiService;
  const { addAlert } = useAlerts();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>();
  const tableColumns = ['Name', 'Cloud provider', 'Region', 'Status'];

  const getActionResolver = (rowData: IRow, onDelete: (data: KafkaRequest) => void) => {
    const { originalData } = rowData;
    const title = getDeleteInstanceLabel(originalData?.status);
    return [
      {
        title,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
    ];
  };

  const preparedTableCells = () => {
    const tableRow: IRow[] = [];
    kafkaInstanceItems.forEach((row: IRow) => {
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

  const actionResolver = (rowData: IRow) => {
    return getActionResolver(rowData, onSelectDeleteInstanceKebab);
  };

  const onSelectDeleteInstanceKebab = (instance: KafkaRequest) => {
    const { status } = instance;
    setSelectedInstance(instance);
    /**
     * Hide confirm modal for status 'failed' and call delete api
     * Show confirm modal for all status except 'failed' and call delete api
     */
    if (status === InstanceStatus.FAILED) {
      //onDeleteInstance();
    } else {
      setIsDeleteModalOpen(!isDeleteModalOpen);
    }
  };

  const onDeleteInstance = async () => {
    /**
     * Throw an error if kafka id is not set 
     * and avoid delete instance api call
     */
    if (selectedInstance?.id === undefined) {
      throw new Error('kafka instance id is not set');
    }

    const { id } = selectedInstance;
    try {
      await apisService.deleteKafkaById(id).then((res) => {
        setIsDeleteModalOpen(false);
        refresh();
        addAlert('Instance successfully deleted', AlertVariant.success);
        console.info('Kafka successfully deleted');
      });
    } catch (error) {
      addAlert(error, AlertVariant.danger);
      console.log(error);
    }
  };

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    selectedInstance?.status,
    selectedInstance?.name
  );

  return (
    <>
      <Card>
        <Table
          cells={tableColumns}
          rows={preparedTableCells()}
          aria-label="Cluster instance list"
          actionResolver={actionResolver}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </Card>
      {isDeleteModalOpen && (
        <DeleteInstanceModal
          title={title}
          isModalOpen={isDeleteModalOpen}
          instanceStatus={selectedInstance?.status}
          setIsModalOpen={setIsDeleteModalOpen}
          onConfirm={onDeleteInstance}
          selectedInstanceName={selectedInstance?.name}
          description={description}
          confirmActionLabel={confirmActionLabel}
        />
      )}
    </>
  );
};

export { StreamsTableView };
