import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Link, useHistory } from 'react-router-dom';
import {
  IAction,
  IExtraColumnData,
  IRowData,
  ISeparator,
  ISortBy,
  sortable,
  SortByDirection,
} from '@patternfly/react-table';
import { PaginationVariant, Skeleton } from '@patternfly/react-core';
import {
  getFormattedDate,
  getLoadingRowsCount,
  getSkeletonForRows,
  InstanceStatus,
  isServiceApiError,
} from '@app/utils';
import {
  MASEmptyState,
  MASEmptyStateVariant,
  MASPagination,
  MASTable,
  MODAL_TYPES,
  useRootModalContext,
} from '@app/common';
import { Configuration, DefaultApi, KafkaRequest } from '@rhoas/kafka-management-sdk';
import './StatusColumn.css';
import { StreamsToolbar, StreamsToolbarProps } from './StreamsToolbar';
import { StatusColumn } from './StatusColumn';
import { AlertVariant, useAlert, useAuth, useConfig, useBasename } from '@bf2/ui-shared';

export type FilterValue = {
  value: string;
  isExact: boolean;
};

export type FilterType = {
  filterKey: string;
  filterValue: FilterValue[];
};

export type StreamsTableProps = StreamsToolbarProps & {
  kafkaInstanceItems: KafkaRequest[];
  onViewInstance: (instance: KafkaRequest) => void;
  onViewConnection: (instance: KafkaRequest) => void;
  mainToggle: boolean;
  refresh: (arg0?: boolean) => void;
  kafkaDataLoaded: boolean;
  onDelete: () => void;
  expectedTotal: number;
  orderBy: string;
  setOrderBy: (order: string) => void;
  isDrawerOpen?: boolean;
  loggedInUser: string | undefined;
  isMaxCapacityReached?: boolean | undefined;
  setWaitingForDelete: (arg0: boolean) => void;
  currentUserkafkas: KafkaRequest[] | undefined;
};

type ConfigDetail = {
  title: string;
  confirmActionLabel: string;
  description: string;
};

export const getDeleteInstanceModalConfig = (
  t: TFunction,
  status: string | undefined,
  instanceName: string | undefined,
  isMaxCapacityReached?: boolean | undefined
): ConfigDetail => {
  const config: ConfigDetail = {
    title: '',
    confirmActionLabel: '',
    description: '',
  };
  /**
   * This is Onboarding changes
   * Todo: remove this change after public eval
   */
  const additionalMessage = isMaxCapacityReached
    ? ' You might not be able to create a new instance because all of them are currently provisioned by other users.'
    : '';

  if (status === InstanceStatus.READY) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete');
    config.description = t('delete_instance_status_complete', { instanceName }) + additionalMessage;
  } else if (
    status === InstanceStatus.ACCEPTED ||
    status === InstanceStatus.PROVISIONING ||
    status === InstanceStatus.PREPARING
  ) {
    config.title = `${t('delete_instance')}?`;
    config.confirmActionLabel = t('delete');
    config.description = t('delete_instance_status_accepted_or_provisioning', { instanceName }) + additionalMessage;
  }
  return config;
};

const StreamsTableView: React.FunctionComponent<StreamsTableProps> = ({
  mainToggle,
  kafkaInstanceItems,
  onViewInstance,
  onViewConnection,
  refresh,
  page,
  perPage,
  total,
  kafkaDataLoaded,
  onDelete,
  expectedTotal,
  filteredValue,
  setFilteredValue,
  setFilterSelected,
  filterSelected,
  orderBy,
  setOrderBy,
  isDrawerOpen,
  isMaxCapacityReached,
  buttonTooltipContent,
  isDisabledCreateButton,
  loggedInUser,
  labelWithTooltip,
  setWaitingForDelete,
  currentUserkafkas,
  cloudProviders,
  onCreate,
}) => {
  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { getBasename } = useBasename() || {};
  const basename = getBasename && getBasename();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const history = useHistory();
  const { addAlert } = useAlert() || {};

  const { showModal, hideModal } = useRootModalContext();
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest | undefined>({});
  const [activeRow, setActiveRow] = useState<string>();
  const [deletedKafkas, setDeletedKafkas] = useState<string[]>([]);
  const [items, setItems] = useState<Array<KafkaRequest>>([]);
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean>();

  const tableColumns = [
    { title: t('name'), transforms: [sortable] },
    { title: t('cloud_provider'), transforms: [sortable] },
    { title: t('region'), transforms: [sortable] },
    { title: t('owner'), transforms: [sortable] },
    { title: t('status'), transforms: [sortable] },
    { title: t('time_created'), transforms: [sortable] },
  ];

  useEffect(() => {
    auth?.isOrgAdmin().then((isOrgAdmin) => setIsOrgAdmin(isOrgAdmin));
  }, [auth]);

  const removeKafkaFromDeleted = (name: string) => {
    const index = deletedKafkas.findIndex((k) => k === name);
    if (index > -1) {
      const prev = Object.assign([], deletedKafkas);
      prev.splice(index, 1);
      setDeletedKafkas(prev);
    }
  };

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      searchParams.set(name, value.toString());
    },
    [searchParams]
  );

  useEffect(() => {
    if (!isDrawerOpen) {
      setActiveRow('');
    }
  }, [isDrawerOpen]);

  const addAlertAfterSuccessDeletion = () => {
    if (currentUserkafkas) {
      // filter all kafkas with status as deprovision
      const deprovisonedKafkas: KafkaRequest[] = currentUserkafkas.filter(
        (k) => k.status === InstanceStatus.DEPROVISION || k.status === InstanceStatus.DELETED
      );

      // filter all new kafka which is not in deleteKafka state
      const notPresentKafkas = deprovisonedKafkas
        .filter((k) => deletedKafkas.findIndex((dk) => dk === k.name) < 0)
        .map((k) => k.name || '');
      // create new array by merging old and new kafka with status as deprovion
      const allDeletedKafkas: string[] = [...deletedKafkas, ...notPresentKafkas];
      // update deleteKafka with new arraycurrentUserkafkaInstanceItems
      setDeletedKafkas(allDeletedKafkas);

      // add alert for deleted kafkas which are completely deleted from the response
      allDeletedKafkas.forEach((k) => {
        const kafkaIndex = currentUserkafkas?.findIndex((item) => item.name === k);
        if (kafkaIndex < 0) {
          removeKafkaFromDeleted(k);
          addAlert &&
            addAlert({
              title: t('kafka_successfully_deleted', { name: k }),
              variant: AlertVariant.success,
            });
        }
      });
    }
  };

  const addAlertAfterSuccessCreation = () => {
    const lastItemsState: KafkaRequest[] = JSON.parse(JSON.stringify(items));
    if (items && items.length > 0) {
      const completedOrFailedItems = Object.assign([], kafkaInstanceItems).filter(
        (item: KafkaRequest) => item.status === InstanceStatus.READY || item.status === InstanceStatus.FAILED
      );
      lastItemsState.forEach((item: KafkaRequest) => {
        const instances: KafkaRequest[] = completedOrFailedItems.filter(
          (cfItem: KafkaRequest) => item.id === cfItem.id
        );
        if (instances && instances.length > 0) {
          if (instances[0].status === InstanceStatus.READY) {
            addAlert &&
              addAlert({
                title: t('kafka_successfully_created'),
                variant: AlertVariant.success,
                description: (
                  <span
                    dangerouslySetInnerHTML={{ __html: t('kafka_success_message', { name: instances[0]?.name }) }}
                  />
                ),
                dataTestId: 'toastCreateKafka-success',
              });
          } else if (instances[0].status === InstanceStatus.FAILED) {
            addAlert &&
              addAlert({
                title: t('kafka_not_created'),
                variant: AlertVariant.danger,
                description: (
                  <span dangerouslySetInnerHTML={{ __html: t('kafka_failed_message', { name: instances[0]?.name }) }} />
                ),
                dataTestId: 'toastCreateKafka-failed',
              });
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
  };

  // Redirect the user to a previous page if there are no kafka instances for a page number / size
  useEffect(() => {
    if (page > 1) {
      if (kafkaInstanceItems.length === 0) {
        setSearchParam('page', (page - 1).toString());
        setSearchParam('perPage', perPage.toString());
        history.push({
          search: searchParams.toString(),
        });
      }
    }
    // handle success alert for deletion
    addAlertAfterSuccessDeletion();
    // handle success alert for creation
    addAlertAfterSuccessCreation();
  }, [page, perPage, kafkaInstanceItems, currentUserkafkas]);

  const onSelectKebabDropdownOption = (
    event: React.ChangeEvent<HTMLSelectElement>,
    originalData: KafkaRequest,
    selectedOption: string
  ) => {
    if (selectedOption === 'view-instance') {
      onViewInstance(originalData);
      //set selected row for view instance and connect instance
      setActiveRow(originalData?.name);
    } else if (selectedOption === 'connect-instance') {
      onViewConnection(originalData);
      setActiveRow(originalData?.name);
    } else if (selectedOption === 'delete-instance') {
      onSelectDeleteInstance(originalData);
    }
    // Set focus back on previous selected element i.e. kebab button
    const previousNode = event?.target?.parentElement?.parentElement?.previousSibling;
    if (previousNode !== undefined && previousNode !== null) {
      (previousNode as HTMLElement).focus();
    }
  };

  const getActionResolver = (rowData: IRowData) => {
    if (!kafkaDataLoaded) {
      return [];
    }
    const originalData: KafkaRequest = rowData.originalData;
    if (originalData.status === InstanceStatus.DEPROVISION || originalData.status === InstanceStatus.DELETED) {
      return [];
    }
    const isUserSameAsLoggedIn = originalData.owner === loggedInUser || isOrgAdmin;
    let additionalProps: any;
    if (!isUserSameAsLoggedIn) {
      additionalProps = {
        tooltip: true,
        isDisabled: true,
        style: {
          pointerEvents: 'auto',
          cursor: 'default',
        },
      };
    }
    const resolver: (IAction | ISeparator)[] = [
      {
        title: t('view_details'),
        id: 'view-instance',
        ['data-testid']: 'tableStreams-actionDetails',
        onClick: (event: React.ChangeEvent<HTMLSelectElement>) =>
          isUserSameAsLoggedIn && onSelectKebabDropdownOption(event, originalData, 'view-instance'),
        ...additionalProps,
        tooltipProps: {
          position: 'left',
          content: t('no_permission_to_view_kafka'),
        },
      },
      {
        title: t('view_connection_information'),
        id: 'connect-instance',
        ['data-testid']: 'tableStreams-actionConnection',
        onClick: (event: any) =>
          isUserSameAsLoggedIn && onSelectKebabDropdownOption(event, originalData, 'connect-instance'),
        ...additionalProps,
        tooltipProps: {
          position: 'left',
          content: t('no_permission_to_connect_kafka'),
        },
      },
      {
        title: t('delete_instance'),
        id: 'delete-instance',
        ['data-testid']: 'tableStreams-actionDelete',
        onClick: (event: any) =>
          isUserSameAsLoggedIn && onSelectKebabDropdownOption(event, originalData, 'delete-instance'),
        ...additionalProps,
        tooltipProps: {
          position: 'left',
          content: t('no_permission_to_delete_kafka'),
        },
      },
    ];
    return resolver;
  };

  const renderNameLink = ({ name, row }) => {
    return (
      <Link to={`${basename}/${row?.id}`} data-testid="tableStreams-linkKafka">
        {name}
      </Link>
    );
  };

  const preparedTableCells = () => {
    const tableRow: (IRowData | string[])[] | undefined = [];
    const loadingCount: number = getLoadingRowsCount(page, perPage, expectedTotal);
    if (!kafkaDataLoaded) {
      return getSkeletonForRows({ loadingCount, skeleton: <Skeleton />, length: tableColumns.length });
    }
    kafkaInstanceItems.forEach((row: IRowData) => {
      const { name, cloud_provider, region, created_at, status, owner } = row;
      const cloudProviderDisplayName = t(cloud_provider);
      const regionDisplayName = t(region);
      tableRow.push({
        cells: [
          {
            title:
              status === InstanceStatus.DEPROVISION || status !== InstanceStatus.READY
                ? name
                : renderNameLink({ name, row }),
          },
          cloudProviderDisplayName,
          regionDisplayName,
          owner,
          {
            title: <StatusColumn status={status} instanceName={name} />,
          },
          {
            title: getFormattedDate(created_at, t('ago')),
          },
        ],
        originalData: row,
      });
    });
    return tableRow;
  };

  const actionResolver = (rowData: IRowData) => {
    return getActionResolver(rowData);
  };

  const onSelectDeleteInstance = (instance: KafkaRequest) => {
    const { status, name } = instance;
    setSelectedInstance(instance);
    if (status === InstanceStatus.FAILED) {
      onDeleteInstance(instance);
    } else {
      const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
        t,
        status,
        name,
        isMaxCapacityReached
      );

      showModal(MODAL_TYPES.DELETE_KAFKA_INSTANCE, {
        instanceStatus: status,
        selectedItemData: instance,
        title,
        confirmButtonProps: {
          onClick: onDeleteInstance,
          label: confirmActionLabel,
        },
        textProps: {
          description,
        },
      });
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
    const accessToken = await auth?.kas.getToken();
    const apisService = new DefaultApi(
      new Configuration({
        accessToken,
        basePath,
      })
    );
    onDelete();
    hideModal();

    try {
      await apisService.deleteKafkaById(instanceId, true).then(() => {
        setActiveRow(undefined);
        setWaitingForDelete(true);
        refresh();
        setSelectedInstance(undefined);
      });
    } catch (error) {
      let reason: string | undefined;
      if (isServiceApiError(error)) {
        reason = error.response?.data.reason;
      }
      /**
       * Todo: show user friendly message according to server code
       * and translation for specific language
       *
       */
      addAlert &&
        addAlert({
          title: t('common.something_went_wrong'),
          variant: AlertVariant.danger,
          description: reason,
        });
    }
  };

  const getParameterForSortIndex = (index: number) => {
    switch (index) {
      case 0:
        return 'name';
      case 1:
        return 'cloud_provider';
      case 2:
        return 'region';
      case 3:
        return 'owner';
      case 4:
        return 'status';
      case 5:
        return 'created_at';
      default:
        return '';
    }
  };

  const getindexForSortParameter = (parameter: string) => {
    switch (parameter.toLowerCase()) {
      case 'name':
        return 0;
      case 'cloud_provider':
        return 1;
      case 'region':
        return 2;
      case 'owner':
        return 3;
      case 'status':
        return 4;
      case 'created_at':
        return 5;
      default:
        return undefined;
    }
  };

  const onSort = (_event: any, index: number, direction: string, extraData: IExtraColumnData) => {
    let myDirection = direction;
    if (getSortBy()?.index !== index && extraData.property === 'time-created') {
      // trick table to sort descending first for date column
      // https://github.com/patternfly/patternfly-react/issues/5329
      myDirection = 'desc';
    }
    setOrderBy(`${getParameterForSortIndex(index)} ${myDirection}`);
  };

  const getSortBy = (): ISortBy | undefined => {
    const sort: string[] = orderBy?.split(' ') || [];
    if (sort.length > 1) {
      return {
        index: getindexForSortParameter(sort[0]),
        direction: sort[1] === SortByDirection.asc ? SortByDirection.asc : SortByDirection.desc,
      };
    }
    return;
  };

  const onRowClick = (event: any, rowIndex: number, row: IRowData) => {
    const { originalData } = row;
    const clickedEventType = event?.target?.type;
    const tagName = event?.target?.tagName;

    // Open modal on row click except kebab button click
    if (clickedEventType !== 'button' && tagName?.toLowerCase() !== 'a') {
      onViewInstance(originalData);
      setActiveRow(originalData?.name);
    }
  };

  return (
    <>
      <StreamsToolbar
        mainToggle={mainToggle}
        filterSelected={filterSelected}
        setFilterSelected={setFilterSelected}
        total={total}
        page={page}
        perPage={perPage}
        filteredValue={filteredValue}
        setFilteredValue={setFilteredValue}
        isDisabledCreateButton={isDisabledCreateButton}
        buttonTooltipContent={buttonTooltipContent}
        labelWithTooltip={labelWithTooltip}
        cloudProviders={cloudProviders}
        onCreate={onCreate}
        refresh={refresh}
      />
      <MASTable
        tableProps={{
          cells: tableColumns,
          rows: preparedTableCells(),
          'aria-label': t('cluster_instance_list'),
          actionResolver: actionResolver,
          onSort: onSort,
          sortBy: getSortBy(),
          hasDefaultCustomRowWrapper: true,
        }}
        activeRow={activeRow}
        onRowClick={onRowClick}
        rowDataTestId="tableStreams-row"
        loggedInUser={loggedInUser}
      />
      {kafkaInstanceItems.length < 1 && kafkaDataLoaded && (
        <MASEmptyState
          emptyStateProps={{
            variant: MASEmptyStateVariant.NoResult,
          }}
          titleProps={{
            title: t('no_results_found'),
          }}
          emptyStateBodyProps={{
            body: t('adjust_your_filters_and_try_again'),
          }}
        />
      )}
      {total > 0 && (
        <MASPagination
          widgetId="pagination-options-menu-bottom"
          itemCount={total}
          variant={PaginationVariant.bottom}
          page={page}
          perPage={perPage}
          titles={{
            paginationTitle: t('full_pagination'),
            perPageSuffix: t('per_page_suffix'),
            toFirstPage: t('to_first_page'),
            toPreviousPage: t('to_previous_page'),
            toLastPage: t('to_last_page'),
            toNextPage: t('to_next_page'),
            optionsToggle: t('options_toggle'),
            currPage: t('curr_page'),
          }}
        />
      )}
    </>
  );
};

export { StreamsTableView };
