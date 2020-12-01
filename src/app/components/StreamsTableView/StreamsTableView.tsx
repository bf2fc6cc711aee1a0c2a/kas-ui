import React, { useState,useContext } from 'react';
import { Table, TableHeader, TableBody, IRow } from '@patternfly/react-table';
import { Card, AlertVariant } from '@patternfly/react-core';
import { DefaultApi,KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { BASE_PATH } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { useHistory } from 'react-router';
import { AuthContext } from '@app/auth/AuthContext';

type TableProps = {
  kafkaInstanceItems: KafkaRequest[];
  mainToggle: boolean;
  onConnectToInstance: (data: KafkaRequest) => void;
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
    config.description = `The <b>${instanceName}</b> instance will be deleted.`;
  } else if (status === InstanceStatus.ACCEPTED || status === InstanceStatus.PROVISIONING) {
    config.title = 'Stop creating instance?';
    config.confirmActionLabel = 'Stop creating instance';
    config.description = `The creation of the <b>${instanceName}</b> instance will be stopped.`;
  }
  return config;
};

const StreamsTableView = ({ mainToggle, kafkaInstanceItems, onConnectToInstance,refresh }: TableProps) => {
  const { token } = useContext(AuthContext);
  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH
  });
  const { addAlert } = useAlerts();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = ['Name', 'Cloud provider', 'Region', 'Status'];

  const getActionResolver = (rowData: IRow, onDelete: (data: KafkaRequest) => void,onConnect: (data: KafkaRequest)=>void) => {
    const { originalData } = rowData;
    const title = getDeleteInstanceLabel(originalData?.status);
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
    return getActionResolver(rowData, onSelectDeleteInstanceKebab,onConnectToInstance);
  };

  const onSelectDeleteInstanceKebab = (instance: KafkaRequest) => {
    const { status } = instance;
    setSelectedInstance(instance);
    /**
     * Hide confirm modal for status 'failed' and call delete api
     * Show confirm modal for all status except 'failed' and call delete api
     */
    if (status === InstanceStatus.FAILED) {
      onDeleteInstance(instance);
    } else {
      setIsDeleteModalOpen(!isDeleteModalOpen);
    }
  };

  const onDeleteInstance = async (instance: KafkaRequest) => {
    const instanceId=selectedInstance?.id || instance?.id;
    /**
     * Throw an error if kafka id is not set
     * and avoid delete instance api call
     */
    if (instanceId === undefined) {
      throw new Error('kafka instance id is not set');
    }

    try {
      await apisService.deleteKafkaById(instanceId).then((res) => {
        setIsDeleteModalOpen(false);
        addAlert('Instance successfully deleted', AlertVariant.success);
        refresh();       
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
