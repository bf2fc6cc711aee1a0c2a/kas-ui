import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableHeader, TableBody, IRow } from '@patternfly/react-table';
import { Card, AlertVariant, Grid, GridItem } from '@patternfly/react-core';
import { DefaultApi, KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { BASE_PATH } from '../../common/app-config';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { TablePagination } from './TablePagination';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { StreamsToolbar } from './StreamsToolbar';
import { AuthContext } from '@app/auth/AuthContext';
import './StatusColumn.css';

type TableProps = {
  kafkaInstanceItems: KafkaRequest[];
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  onConnectToInstance: (data: KafkaRequest) => void;
  refresh: () => void;
  page: number;
  perPage: number;
  total: number;
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

export const getDeleteInstanceModalConfig = (
  t: Function,
  status: string | undefined,
  instanceName: string | undefined
) => {
  const config = {
    title: '',
    confirmActionLabel: '',
    description: '',
  };
  if (status === InstanceStatus.COMPLETED) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete_instance');
    config.description = `The <b>${instanceName}</b> instance will be deleted.`;
  } else if (status === InstanceStatus.ACCEPTED || status === InstanceStatus.PROVISIONING) {
    config.title = `${t('stop_creating_instance')}?`;
    config.confirmActionLabel = t('stop_creating_instance');
    config.description = `The creation of the <b>${instanceName}</b> instance will be stopped.`;
  }
  return config;
};

const StreamsTableView = ({
  mainToggle,
  kafkaInstanceItems,
  onConnectToInstance,
  refresh,
  createStreamsInstance,
  setCreateStreamsInstance,
  page,
  perPage,
  total,
}: TableProps) => {
  const { token } = useContext(AuthContext);
  const { t } = useTranslation();

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH,
  });
  const { addAlert } = useAlerts();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = [t('name'), t('cloud_provider'), t('region'), t('status')];
  const [filterSelected, setFilterSelected] = useState('Name');
  const [namesSelected, setNamesSelected] = useState<string[]>([]);

  useEffect(() => {
    refresh();
  }, [page, perPage]);

  const getActionResolver = (
    rowData: IRow,
    onDelete: (data: KafkaRequest) => void,
    onConnect: (data: KafkaRequest) => void
  ) => {
    const { originalData } = rowData;
    const title = getDeleteInstanceLabel(originalData?.status);
    return [
      {
        title,
        id: 'delete-instance',
        onClick: () => onDelete(originalData),
      },
      {
        title: t('connect_to_instance'),
        id: 'connect-instance',
        onClick: () => onConnect(originalData),
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
    return getActionResolver(rowData, onSelectDeleteInstanceKebab, onConnectToInstance);
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

    try {
      await apisService.deleteKafkaById(instanceId).then((res) => {
        setIsDeleteModalOpen(false);
        addAlert(t('kafka_successfully_deleted'), AlertVariant.success);
        refresh();
        console.info(t('kafka_successfully_deleted'));
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      addAlert(error, AlertVariant.danger);
      console.log(error);
    }
  };

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    t,
    selectedInstance?.status,
    selectedInstance?.name
  );

  const renderPagination = (isCompact?: boolean) => {
    return <TablePagination itemCount={total} variant={'top'} page={page} perPage={perPage} isCompact={isCompact} />;
  };

  return (
    <Card>
      <Grid>
        <GridItem span={7}>
          <StreamsToolbar
            mainToggle={mainToggle}
            createStreamsInstance={createStreamsInstance}
            setCreateStreamsInstance={setCreateStreamsInstance}
            filterSelected={filterSelected}
            namesSelected={namesSelected}
            setNamesSelected={setNamesSelected}
          />
        </GridItem>
        <GridItem span={5} className="toolbar-pagination-alignment">
          {renderPagination(true)}
        </GridItem>
      </Grid>
      <Table
        cells={tableColumns}
        rows={preparedTableCells()}
        aria-label={t('aria_cluster_instance_list')}
        actionResolver={actionResolver}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <div className="pagination-alignment">{renderPagination()}</div>
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
