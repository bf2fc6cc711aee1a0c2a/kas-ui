import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { IAction, IExtraData, IRowData, ISeparator, Table, TableBody, TableHeader } from '@patternfly/react-table';
import { AlertVariant, Card, Divider, PaginationVariant, Tooltip } from '@patternfly/react-core';
import { DefaultApi, KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { getCloudProviderDisplayName, getCloudRegionDisplayName } from '@app/utils';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { TablePagination } from './TablePagination';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { StreamsToolbar } from './StreamsToolbar';
import { AuthContext } from '@app/auth/AuthContext';
import './StatusColumn.css';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';
import { KeycloakContext } from '@app/auth/keycloak/KeycloakContext';

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
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete_instance');
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
  const { t } = useTranslation();
  const keycloakContext = useContext(KeycloakContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = [t('name'), t('cloud_provider'), t('region'), t('owner'), t('status')];
  const [filterSelected, setFilterSelected] = useState('Name');
  const [namesSelected, setNamesSelected] = useState<string[]>([]);
  const [items, setItems] = useState<Array<KafkaRequest>>([]);

  const loggedInOwner: string | undefined =
    keycloakContext?.keycloak?.tokenParsed && keycloakContext?.keycloak?.tokenParsed['username'];
  const { addAlert } = useAlerts();

  useEffect(() => {
    const lastItemsState: KafkaRequest[] = JSON.parse(JSON.stringify(items));
    if (items && items.length > 0) {
      const completedOrFailedItems = Object.assign([], kafkaInstanceItems).filter(
        (item: KafkaRequest) => item.status === InstanceStatus.COMPLETED || item.status === InstanceStatus.FAILED
      );
      lastItemsState.forEach((item: KafkaRequest) => {
        const instances: KafkaRequest[] = completedOrFailedItems.filter(
          (cfItem: KafkaRequest) => item.id === cfItem.id
        );
        if (instances && instances.length > 0) {
          if (instances[0].status === InstanceStatus.COMPLETED) {
            addAlert(
              t('kafka_successfully_created'),
              AlertVariant.success,
              <span dangerouslySetInnerHTML={{ __html: t('kafka_success_message', { name: instances[0]?.name }) }} />
            );
          } else if (instances[0].status === InstanceStatus.FAILED) {
            addAlert(
              t('kafka_not_created'),
              AlertVariant.danger,
              <span dangerouslySetInnerHTML={{ __html: t('kafka_failed_message', { name: instances[0]?.name }) }} />
            );
          }
        }
      });
    }
    const incompleteKafkas = Object.assign(
      [],
      kafkaInstanceItems.filter(
        (item: KafkaRequest) => item.status === InstanceStatus.PROVISIONING || item.status === InstanceStatus.ACCEPTED
      )
    );
    setItems(incompleteKafkas);
  }, [kafkaInstanceItems]);

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequest) => void) => {
    const originalData: KafkaRequest = rowData.originalData;
    const isUserSameAsLoggedIn = originalData.owner === loggedInOwner;
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
            title: t('delete_instance'),
            id: 'delete-instance',
            onClick: () => isUserSameAsLoggedIn && onDelete(originalData),
            tooltip: !isUserSameAsLoggedIn,
            tooltipProps: {
              position: 'left',
              content: t('no_permission_to_delete_kafka'),
            },
            isDisabled: !isUserSameAsLoggedIn,
            style: {
              pointerEvents: 'auto',
              cursor: 'default',
            },
          },
        ]
      : [
          {
            title: t('view_details'),
            id: 'view-instance',
            onClick: () => onViewInstance(originalData),
          },
          {
            title: t('delete_instance'),
            id: 'delete-instance',
            onClick: () => isUserSameAsLoggedIn && onDelete(originalData),
            tooltip: !isUserSameAsLoggedIn,
            tooltipProps: {
              position: 'left',
              content: t('no_permission_to_delete_kafka'),
            },
            isDisabled: !isUserSameAsLoggedIn,
            style: {
              pointerEvents: 'auto',
              cursor: 'default',
            },
          },
        ];
    return resolver;
  };

  const preparedTableCells = () => {
    const tableRow: (IRowData | string[])[] | undefined = [];
    kafkaInstanceItems.forEach((row: IRowData) => {
      const { name, cloud_provider, region, status, owner } = row;
      const cloudProviderDisplayName = getCloudProviderDisplayName(cloud_provider);
      const regionDisplayName = getCloudRegionDisplayName(region);
      tableRow.push({
        cells: [
          name,
          cloudProviderDisplayName,
          regionDisplayName,
          owner,
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
      await apisService.deleteKafkaById(instanceId).then(() => {
        setIsDeleteModalOpen(false);
        addAlert(t('kafka_successfully_deleted'), AlertVariant.success);
        refresh();
      });
    } catch (error) {
      setIsDeleteModalOpen(false);
      let reason;
      if (isServiceApiError(error)) {
        reason = error.response?.data.reason;
      }
      /**
       * Todo: show user friendly message according to server code
       * and translation for specific language
       *
       */
      addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
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
