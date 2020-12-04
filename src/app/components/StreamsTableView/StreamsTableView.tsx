import React, { useState, useContext } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  IRow,
  IRowData,
  IExtraData,
  ISeparator,
  IAction,
} from '@patternfly/react-table';
import { Card, AlertVariant } from '@patternfly/react-core';
import { DefaultApi, KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { BASE_PATH } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { StreamsToolbar } from './StreamsToolbar';
import { useHistory } from 'react-router';
import { AuthContext } from '@app/auth/AuthContext';

type TableProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  kafkaInstanceItems: KafkaRequest[];
  onViewInstance: (instance: KafkaRequest) => void;
  onConnectToInstance: (instance: KafkaRequest) => void;
  mainToggle: boolean;
  refresh: () => void;
};

export const getDeleteInstanceLabel = (status?: InstanceStatus | string) => {
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

const StreamsTableView = ({
  mainToggle,
  kafkaInstanceItems,
  onViewInstance,
  onConnectToInstance,
  refresh,
  createStreamsInstance,
  setCreateStreamsInstance,
}: TableProps) => {
  const { getToken } = useContext(AuthContext);
  const { addAlert } = useAlerts();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = ['Name', 'Cloud provider', 'Region', 'Status'];
  const [filterSelected, setFilterSelected] = useState('Name');
  const [namesSelected, setNamesSelected] = useState<string[]>([]);

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequest) => void) => {
    const originalData: KafkaRequest = rowData.originalData;
    const deleteActionTitle = getDeleteInstanceLabel(originalData?.status);
    const resolver: (IAction | ISeparator)[] = mainToggle ? [
      {
        title: 'View details',
        id: 'view-instance',
        onClick: () => onViewInstance(originalData),
      },{
            title: 'Connect to this instance',
            id: 'connect-instance',
            onClick: () => onConnectToInstance(originalData),
      },
      {
        title: deleteActionTitle,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
    ]:[
      {
        title: 'View details',
        id: 'view-instance',
        onClick: () => onViewInstance(originalData),
      },
      {
        title: deleteActionTitle,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
    ];
    return resolver;
  };

  const preparedTableCells = () => {
    const tableRow: (IRowData | string[])[] | undefined = [];
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

  const actionResolver = (rowData: IRowData, _extraData: IExtraData) => {
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
      onDeleteInstance(instance);
    } else {
      setIsDeleteModalOpen(!isDeleteModalOpen);
    }
  };

  const onDeleteInstance = async (instance: KafkaRequest) => {
    const instanceId = selectedInstance?.id || instance?.id;
    /**
     * Throw an error if kafka id is not set
     * and avoid delete instance api call
     */
    if (instanceId === undefined) {
      throw new Error('kafka instance id is not set');
    }

    const accessToken = await getToken();
    const apisService = new DefaultApi({
      accessToken,
      BASE_PATH,
    });

    try {
      await apisService.deleteKafkaById(instanceId).then((res) => {
        setIsDeleteModalOpen(false);
        addAlert('Instance successfully deleted', AlertVariant.success);
        refresh();
        console.info('Kafka successfully deleted');
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      addAlert(error, AlertVariant.danger);
      console.log(error);
    }
  };

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    selectedInstance?.status,
    selectedInstance?.name
  );

  return (
    <Card>
      <StreamsToolbar
        mainToggle={mainToggle}
        createStreamsInstance={createStreamsInstance}
        setCreateStreamsInstance={setCreateStreamsInstance}
        filterSelected={filterSelected}
        namesSelected={namesSelected}
        setNamesSelected={setNamesSelected}
      />
      <Table
        cells={tableColumns}
        rows={preparedTableCells()}
        aria-label="Cluster instance list"
        actionResolver={actionResolver}
      >
        <TableHeader />
        <TableBody />
      </Table>
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
    </Card>
  );
};

export { StreamsTableView };
