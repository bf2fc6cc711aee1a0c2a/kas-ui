import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import {
  IAction,
  IExtraData,
  IRowData,
  ISeparator,
  Table,
  TableBody,
  TableHeader,
  IRowCell,
} from '@patternfly/react-table';
import {
  AlertVariant,
  PaginationVariant,
  Skeleton,
  Button,
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant
} from '@patternfly/react-core';
import { DefaultApi, KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { InstanceStatus } from '@app/constants';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { TablePagination } from './TablePagination';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { StreamsToolbar } from './StreamsToolbar';
import { AuthContext } from '@app/auth/AuthContext';
import './StatusColumn.css';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';
import { KeycloakContext } from '@app/auth/keycloak/KeycloakContext';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

type TableProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  kafkaInstanceItems: KafkaRequest[];
  onViewInstance: (instance: KafkaRequest) => void;
  onViewConnection: (instance: KafkaRequest) => void;
  onConnectToInstance: (data: KafkaRequest) => void;
  mainToggle: boolean;
  refresh: (operation: string) => void;
  page: number;
  perPage: number;
  total: number;
  kafkaDataLoaded: boolean;
  expectedTotal: number;
  filteredValue: { property: string };
  setFilteredValue: (filteredValue: { property: string }) => void;
  filterSelected: string;
  setFilterSelected: (filterSelected: string) => void;
  listOfOwners: string[];
  rawKafkaDataLength: number;
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
  onViewConnection,
  onConnectToInstance,
  refresh,
  createStreamsInstance,
  setCreateStreamsInstance,
  page,
  perPage,
  total,
  kafkaDataLoaded,
  expectedTotal,
  filteredValue,
  setFilteredValue,
  setFilterSelected,
  filterSelected,
  listOfOwners
}: TableProps) => {
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const tableColumns = [t('name'), t('cloud_provider'), t('region'), t('owner'), t('status')];
  const [items, setItems] = useState<Array<KafkaRequest>>([]);
  const [loggedInUser, setLoggedInUser] = useState<string|undefined>(undefined);
  const searchParams = new URLSearchParams(location.search);
  const history = useHistory();

  const { addAlert } = useAlerts();

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      searchParams.set(name, value.toString());
    },
    [searchParams]
  );

  useEffect(() => {
    authContext?.getUsername().then(username => setLoggedInUser(username));
  }, []);

  // function to get exact number of skeleton count required for the current page
  const getLoadingRowsCount = () => {
    // initiaise loadingRowCount by perPage
    let loadingRowCount = perPage;
    /*
      if number of expected count is greater than 0
        calculate the loadingRowCount
      else
        leave the loadingRowCount to perPage
     */
    if (expectedTotal && expectedTotal > 0) {
      // get total number of pages
      const totalPage =
        expectedTotal % perPage !== 0 ? Math.floor(expectedTotal / perPage) + 1 : Math.floor(expectedTotal / perPage);
      // check whether the current page is the last page
      if (page === totalPage) {
        // check whether to total expected count is greater than perPage count
        if (expectedTotal > perPage) {
          // assign the calculated skelton rows count to display the exact number of expected loading skelton rows
          loadingRowCount = expectedTotal % perPage === 0 ? perPage : expectedTotal % perPage;
        } else {
          loadingRowCount = expectedTotal;
        }
      }
    }
    // return the exact number of skeleton expected at the time of loading
    return loadingRowCount !== 0 ? loadingRowCount : perPage;
  };
  useEffect(() => {
    /*
      the logic is to redirect the user to previous page
      if there are no content for the particular page number and page size
    */
    if (page > 1) {
      if (kafkaInstanceItems.length === 0) {
        setSearchParam('page', (page - 1).toString());
        setSearchParam('perPage', perPage.toString());
        history.push({
          search: searchParams.toString(),
        });
      }
    }

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
      kafkaInstanceItems?.filter(
        (item: KafkaRequest) => item.status === InstanceStatus.PROVISIONING || item.status === InstanceStatus.ACCEPTED
      )
    );
    setItems(incompleteKafkas);
  }, [page, perPage, kafkaInstanceItems]);

  const getActionResolver = (rowData: IRowData, onDelete: (data: KafkaRequest) => void) => {
    if (!kafkaDataLoaded) {
      return [];
    }
    const originalData: KafkaRequest = rowData.originalData;
    const isUserSameAsLoggedIn = originalData.owner === loggedInUser;
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
            onClick: () => onViewConnection(originalData),
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
    const loadingCount: number = getLoadingRowsCount();
    if (!kafkaDataLoaded) {
      // for loading state
      const cells: (React.ReactNode | IRowCell)[] = [];
      //get exact number of skeleton cells based on total columns
      for (let i = 0; i < tableColumns.length; i++) {
        cells.push({ title: <Skeleton /> });
      }
      // get exact of skeleton rows based on expected total count of instances
      for (let i = 0; i < loadingCount; i++) {
        tableRow.push({
          cells: cells,
        });
      }
      return tableRow;
    }
    kafkaInstanceItems.forEach((row: IRowData) => {
      const { name, cloud_provider, region, status, owner } = row;
      const cloudProviderDisplayName = t(cloud_provider);
      const regionDisplayName = t(region);
      tableRow.push({
        cells: [
          {
            title: (
              <Button variant="link" isInline onClick={() => onConnectToInstance(row as KafkaRequest)}>
                {name}
              </Button>
            ),
          },
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

    const accessToken = await authContext?.getToken();
    const apisService = new DefaultApi({
      accessToken,
      basePath,
    });

    try {
      await apisService.deleteKafkaById(instanceId).then(() => {
        setIsDeleteModalOpen(false);
        addAlert(t('kafka_successfully_deleted'), AlertVariant.success);
        refresh('delete');
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
    <>
      <StreamsToolbar
        mainToggle={mainToggle}
        createStreamsInstance={createStreamsInstance}
        setCreateStreamsInstance={setCreateStreamsInstance}
        filterSelected={filterSelected}
        setFilterSelected={setFilterSelected}
        total={total}
        page={page}
        perPage={perPage}
        filteredValue={filteredValue}
        setFilteredValue={setFilteredValue}
        listOfOwners={listOfOwners}
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
      { kafkaInstanceItems.length < 1 && (
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h2" size="lg">
          No matches
        </Title>
        <EmptyStateBody>
          Please try adjusting your search query and try again.
        </EmptyStateBody>
      </EmptyState>
      )}
      <TablePagination
        widgetId="pagination-options-menu-bottom"
        itemCount={total}
        variant={PaginationVariant.bottom}
        page={page}
        perPage={perPage}
        paginationTitle={t('full_pagination')}
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
    </>
  );
};

export { StreamsTableView };
