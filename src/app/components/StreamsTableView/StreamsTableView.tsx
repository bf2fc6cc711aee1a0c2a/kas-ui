import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { IAction, IExtraData, IRowData, ISeparator, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { AlertVariant, Card, Divider, PaginationVariant } from '@patternfly/react-core';
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
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';

type TableProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  kafkaInstanceItems: KafkaRequest[];
  onViewInstance: (instance: KafkaRequest) => void;
  onConnectToInstance: (instance: KafkaRequest) => void;
  mainToggle: boolean;
  refresh: () => void;
  page: number;
  perPage: number;
  total: number;
};

type ConfigDetail = {
  title: string;
  confirmActionLabel: string;
  description: string;
};

export const getDeleteInstanceLabel = (t: TFunction, status: string | undefined) => {
  switch (status) {
    case InstanceStatus.COMPLETED:
      return t('delete_instance');
    case InstanceStatus.FAILED:
      return t('remove');
    case InstanceStatus.ACCEPTED:
    case InstanceStatus.PROVISIONING:
      return t('stop_instance');
    default:
      return;
  }
};

export const getDeleteInstanceModalConfig = (
  t: TFunction,
  status: string | undefined,
  instanceName: string | undefined
): ConfigDetail => {
  const config: ConfigDetail = {
    title: '',
    confirmActionLabel: '',
    description: '',
  };
  if (status === InstanceStatus.COMPLETED) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete_instance');
    config.description = t('delete_instance_status_complete', { instanceName });
  } else if (status === InstanceStatus.ACCEPTED || status === InstanceStatus.PROVISIONING) {
    config.title = `${t('stop_creating_instance')}?`;
    config.confirmActionLabel = t('stop_creating_instance');
    config.description = t('delete_instance_status_accepted_or_provisioning', { instanceName });
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
  page,
  perPage,
  total,
}: TableProps) => {
  const { getToken } = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { t, i18n } = useTranslation();

  const { addAlert } = useAlerts();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = [t('name'), t('cloud_provider'), t('region'), t('status')];
  const [filterSelected, setFilterSelected] = useState('Name');
  const [namesSelected, setNamesSelected] = useState<string[]>([]);

  useEffect(() => {
    refresh();
  }, [page, perPage]);

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequest) => void) => {
    const originalData: KafkaRequest = rowData.originalData;
    const deleteActionTitle = getDeleteInstanceLabel(t, originalData?.status);
    const resolver: (IAction | ISeparator)[] = mainToggle
      ? [
          {
            title: t('view_details'),
            id: 'view-instance',
            onClick: () => onViewInstance(originalData),
          },
          {
            title: t('connect_to_instance'),
            id: 'connect-instance',
            onClick: () => onConnectToInstance(originalData),
          },
          {
            title: deleteActionTitle,
            id: 'delete-instance',
            onClick: () => onDelete(originalData),
          },
        ]
      : [
          {
            title: t('view_details'),
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
      basePath,
    });

    try {
      await apisService.deleteKafkaById('').then(() => {
        setIsDeleteModalOpen(false);
        addAlert(t('kafka_successfully_deleted'), AlertVariant.success);
        refresh();
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      let key: string = '';
      if (isServiceApiError(error)) {
        key = error.response?.data.code;
      }
      const message = i18n.exists(key) ? t(key) : t('something_went_wrong');
      addAlert(message, AlertVariant.danger);
    }
  };

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    t,
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
        setFilterSelected={setFilterSelected}
        setNamesSelected={setNamesSelected}
        total={total}
        page={page}
        perPage={perPage}
      />
      <Table
        cells={tableColumns}
        rows={preparedTableCells()}
        aria-label={t('cluster_instance_list')}
        actionResolver={actionResolver}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Divider />
      <TablePagination
        widgetId="pagination-options-menu-bottom"
        itemCount={total}
        variant={PaginationVariant.bottom}
        page={page}
        perPage={perPage}
      />
      {isDeleteModalOpen && (
        <DeleteInstanceModal
          title={title}
          selectedInstance={selectedInstance}
          isModalOpen={isDeleteModalOpen}
          instanceStatus={selectedInstance?.status}
          setIsModalOpen={setIsDeleteModalOpen}
          onConfirm={onDeleteInstance}
          description={description}
          confirmActionLabel={confirmActionLabel}
        />
      )}
    </Card>
  );
};

export { StreamsTableView };
