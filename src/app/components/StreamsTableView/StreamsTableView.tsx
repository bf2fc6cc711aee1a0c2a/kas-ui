import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TFunction } from 'i18next';
import {
  IAction,
  IExtraData,
  IRowData,
  ISeparator,
  IRowCell,
  sortable,
  ISortBy,
  SortByDirection,
  IExtraColumnData,
} from '@patternfly/react-table';
import {
  AlertVariant,
  PaginationVariant,
  Skeleton,
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { MASPagination, MASTable } from '@app/common';
import { DefaultApi, KafkaRequest } from '../../../openapi/api';
import { StatusColumn } from './StatusColumn';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { StreamsToolbar } from './StreamsToolbar';
import { AuthContext } from '@app/auth/AuthContext';
import './StatusColumn.css';
import { ApiContext } from '@app/api/ApiContext';
import { InstanceStatus, isServiceApiError } from '@app/utils';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import { formatDistance } from 'date-fns';
import './StreamsTableView.css';
import { css } from '@patternfly/react-styles';
import StreamsActionResolver from './StreamsActionResolver';

export type FilterValue = {
  value: string;
  isExact: boolean;
};

export type FilterType = {
  filterKey: string;
  filterValue: FilterValue[];
};

export type StreamsTableProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  kafkaInstanceItems: KafkaRequest[];
  onViewInstance: (instance: KafkaRequest) => void;
  onViewConnection: (instance: KafkaRequest) => void;
  onConnectToInstance: (data: KafkaRequest) => void;
  getConnectToInstancePath: (data: KafkaRequest) => string;
  mainToggle: boolean;
  refresh: () => void;
  page: number;
  perPage: number;
  total: number;
  kafkaDataLoaded: boolean;
  onDelete: () => void;
  expectedTotal: number;
  filteredValue: Array<FilterType>;
  setFilteredValue: (filteredValue: Array<FilterType>) => void;
  filterSelected: string;
  setFilterSelected: (filterSelected: string) => void;
  orderBy: string;
  setOrderBy: (order: string) => void;
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
  if (status === InstanceStatus.READY) {
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
  getConnectToInstancePath,
  refresh,
  createStreamsInstance,
  setCreateStreamsInstance,
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
}: StreamsTableProps) => {
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedInstance, setSelectedInstance] = useState<KafkaRequest>({});
  const [activeRow, setActiveRow] = useState<number>();
  const [selectedActionInstanceName, setSelectedActionInstanceName] = useState<string>();

  const [deletedKafkas, setDeletedKafkas] = useState<string[]>([]);
  const tableColumns = [
    { title: t('name'), transforms: [sortable] },
    { title: t('cloud_provider'), transforms: [sortable] },
    { title: t('region'), transforms: [sortable] },
    { title: t('owner'), transforms: [sortable] },
    { title: t('status'), transforms: [sortable] },
    { title: t('time_created'), transforms: [sortable] },
    '',
  ];
  const [items, setItems] = useState<Array<KafkaRequest>>([]);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(undefined);
  const searchParams = new URLSearchParams(location.search);
  const history = useHistory();

  const { addAlert } = useAlerts();

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
    authContext?.getUsername().then((username) => setLoggedInUser(username));
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

  const addAlertAfterSuccessDeletion = () => {
    // filter all kafkas with status as deprovision
    const deprovisonedKafkas = kafkaInstanceItems.filter((kafka) => kafka.status === InstanceStatus.DEPROVISION);

    // filter all new kafka which is not in deleteKafka state
    const notPresentKafkas = deprovisonedKafkas
      .filter((k) => deletedKafkas.findIndex((dk) => dk === k.name) < 0)
      .map((k) => k.name || '');
    // create new array by merging old and new kafka with status as deprovion
    const allDeletedKafkas: string[] = [...deletedKafkas, ...notPresentKafkas];
    // update deleteKafka with new array
    setDeletedKafkas(allDeletedKafkas);

    // add alert for deleted kafkas which are completely deleted from the response
    allDeletedKafkas.forEach((k) => {
      if (kafkaInstanceItems.findIndex((item) => item.name === k) < 0) {
        removeKafkaFromDeleted(k);
        addAlert(t('kafka_successfully_deleted', { name: k }), AlertVariant.success);
      }
    });
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
    // handle success alert for deletion
    addAlertAfterSuccessDeletion();
    // handle success alert for creation
    addAlertAfterSuccessCreation();
  }, [page, perPage, kafkaInstanceItems]);

  const onSelectKebabDropdownOption = (
    event: any,
    originalData: KafkaRequest,
    selectedOption: string,
    rowIndex: number | undefined
  ) => {
    setSelectedInstance(originalData);
    if (selectedOption === 'view-instance') {
      onViewInstance(originalData);
    } else if (selectedOption === 'connect-instance') {
      onViewConnection(originalData);
    } else if (selectedOption === 'delete-instance') {
      onSelectDeleteInstance(originalData);
    }
    // Set focus back on previous selected element i.e. kebab button
    event?.target?.parentElement?.parentElement?.previousSibling?.focus();
    setActiveRow(rowIndex);
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

    const formatDate = (date) => {
      date = typeof date === 'string' ? new Date(date) : date;
      return (
        <>
          {formatDistance(date, new Date())} {t('ago')}
        </>
      );
    };

    const NameLink = ({ name, row }) =>
      mainToggle ? (
        <a href="http://uxd-mk-data-plane-cmolloy.apps.uxd-os-research.shz4.p1.openshiftapps.com/openshiftstreams">
          {name}
        </a>
      ) : (
        <Link
          to={() => getConnectToInstancePath(row as KafkaRequest)}
          onClick={(e) => {
            e.preventDefault();
            onConnectToInstance(row as KafkaRequest);
          }}
        >
          {name}
        </Link>
      );

    kafkaInstanceItems.forEach((row: IRowData, index: number) => {
      const { name, cloud_provider, region, created_at, status, owner } = row;
      const cloudProviderDisplayName = t(cloud_provider);
      const regionDisplayName = t(region);
      tableRow.push({
        cells: [
          {
            title: status === InstanceStatus.DEPROVISION ? name : <NameLink row={row} name={name} />,
          },
          cloudProviderDisplayName,
          regionDisplayName,
          owner,
          {
            title: <StatusColumn status={status} instanceName={name} />,
          },
          {
            title: formatDate(created_at),
          },
          {
            title: (
              <StreamsActionResolver
                selectedActionInstanceName={selectedActionInstanceName}
                setSelectedActionInstanceName={setSelectedActionInstanceName}
                rowData={row as KafkaRequest}
                onSelect={onSelectKebabDropdownOption}
                loggedInUser={loggedInUser}
                rowIndex={index}
              />
            ),
          },
        ],
        originalData: row,
      });
    });
    return tableRow;
  };

  const onSelectDeleteInstance = (instance: KafkaRequest) => {
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
    onDelete();
    setIsDeleteModalOpen(false);
    try {
      await apisService.deleteKafkaById(instanceId, true).then(() => {
        setActiveRow(undefined);
        refresh();
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
      addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
    }
  };

  const { title, confirmActionLabel, description } = getDeleteInstanceModalConfig(
    t,
    selectedInstance?.status,
    selectedInstance?.name
  );

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
    // Open modal on row click except kebab button click
    if (clickedEventType !== 'button') {
      onViewInstance(originalData);
      setActiveRow(rowIndex);
    }
  };

  const customRowWrapper = ({ className, rowProps, row, ...props }) => {
    const { rowIndex } = rowProps;
    const { isExpanded } = row;
    const status: string = row?.originalData?.status || '';
    const isRowDeleted = status === InstanceStatus.DEPROVISION;
    return (
      <tr
        className={css(
          className,
          'pf-c-table-row__item',
          isRowDeleted ? 'pf-m-disabled' : 'pf-m-selectable',
          activeRow === rowIndex && 'pf-m-selected'
        )}
        hidden={isExpanded !== undefined && !isExpanded}
        onClick={(event: any) => !isRowDeleted && onRowClick(event, rowIndex, row)}
        {...props}
      />
    );
  };

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
      />
      <MASTable
        tableProps={{
          className: 'mk--streams-table-view__table',
          cells: tableColumns,
          rows: preparedTableCells(),
          'aria-label': t('cluster_instance_list'),
          // actionResolver: actionResolver,
          onSort: onSort,
          sortBy: getSortBy(),
          rowWrapper: customRowWrapper,
        }}
      />
      {kafkaInstanceItems.length < 1 && kafkaDataLoaded && (
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h2" size="lg">
            {t('no_results_found')}
          </Title>
          <EmptyStateBody>{t('no_results_match_the_filter_criteria')}</EmptyStateBody>
        </EmptyState>
      )}
      {total && total > 0 && (
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
    </>
  );
};

export { StreamsTableView };
