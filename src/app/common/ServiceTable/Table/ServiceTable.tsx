import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import {
  IAction,
  IRowData,
  ISortBy,
  OnSort,
  SortByDirection,
} from '@patternfly/react-table';
import {
  AlertVariant,
  PaginationVariant,
  Skeleton,
} from '@patternfly/react-core';
import {
  getFormattedDate,
  getLoadingRowsCount,
  getSkeletonForRows, InstanceType
} from '@app/utils';
import {
  KAFKA_MODAL_TYPES,
  MASPagination,
  MASTable,
  useRootModalContext,
} from '@app/common';
import './StatusColumn.css';
import { ServiceToolbar, ServiceToolbarProps } from '../Toolbar/ServiceToolbar';
import { StatusColumn } from './StatusColumn';
import {
  FieldType,
  InstanceStatus,
  ServiceTableConfig,
} from '@app/modules/KasTable/config';
import { ServiceTableEmptyState } from '@app/common/ServiceTable/Table/ServiceTableEmptyState';
import { usePrevious } from '@app/common/ServiceTable/Table/utils';
import { getDeleteInstanceModalConfig } from '@app/common/ServiceTable/Table/deleteModal';
import { useAlert, useAuth, useBasename } from '@rhoas/app-services-ui-shared';

export type InstanceBaseProps = {
  status?: string;
  name?: string;
  id?: string;
  owner?: string;
  instance_type?: InstanceType
};

export type ServiceTableProps<T extends InstanceBaseProps> =
  ServiceToolbarProps & {
    instances?: T[];
    onViewInstance: (instance: T) => void;
    onViewConnection: (instance: T) => void;
    dataLoaded: boolean;
    onDelete: (instance: T) => Promise<void>;
    expectedTotal: number;
    orderBy: string;
    setOrderBy: (order: string) => void;
    loggedInUser: string | undefined;
    isMaxCapacityReached?: boolean | undefined;
    setWaitingForDelete: (arg0: boolean) => void;
    openCreateModal: () => Promise<void>;
    config: ServiceTableConfig;
  };

const ServiceTable = <T extends InstanceBaseProps>({
  instances,
  onViewInstance,
  onViewConnection,
  page,
  perPage,
  total,
  dataLoaded,
  onDelete,
  expectedTotal,
  filter,
  setFilter,
  orderBy,
  setOrderBy,
  isMaxCapacityReached,
  buttonTooltipContent,
  isDisabledCreateButton,
  loggedInUser,
  labelWithTooltip,
  openCreateModal,
  config,
}: PropsWithChildren<ServiceTableProps<T>>): React.ReactElement => {
  const auth = useAuth();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const history = useHistory();
  const { addAlert } = useAlert() || {};
  const { getBasename } = useBasename() || {};

  const { showModal, hideModal } = useRootModalContext();
  const previousInstances = usePrevious(instances);
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean>();

  useEffect(() => {
    auth.isOrgAdmin()?.then((isOrgAdmin) => setIsOrgAdmin(isOrgAdmin));
  }, [auth]);

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      searchParams.set(name, value.toString());
    },
    [searchParams]
  );

  // Send alerts on state change
  useEffect(() => {
    // ignore the initial load
    if (instances === undefined || previousInstances === undefined) {
      return;
    }
    const handled: string[] = [];
    instances.forEach((instance) => {
      if (instance.id) {
        handled.push(instance.id);
        const previous = previousInstances?.find((p) => p.id === instance.id);
        // Instances don't appear out of thin air, this is safe
        if (previous !== undefined && instance.status !== previous?.status) {
          if (instance.status === InstanceStatus.READY) {
            addAlert &&
              addAlert({
                title: t('kafka_successfully_created'),
                variant: AlertVariant.success,
                description: (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('kafka_success_message', {
                        name: instance.name,
                      }),
                    }}
                  />
                ),
                dataTestId: 'toastCreateKafka-success',
              });
          } else if (instance.status === InstanceStatus.FAILED) {
            addAlert &&
              addAlert({
                title: t('kafka_not_created'),
                variant: AlertVariant.danger,
                description: (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('kafka_failed_message', {
                        name: instance.name,
                      }),
                    }}
                  />
                ),
                dataTestId: 'toastCreateKafka-failed',
              });
          }
        }
      }
    });
    previousInstances?.forEach((p) => {
      if (
        (p.status === InstanceStatus.DEPROVISION ||
          p.status === InstanceStatus.DELETED) &&
        !handled.find((h) => h === p.id)
      ) {
        addAlert &&
          addAlert({
            title: t('kafka_successfully_deleted', { name: p.name }),
            variant: AlertVariant.success,
          });
      }
    });
  }, [instances]);

  // Redirect the user to a previous page if there are no kafka instances for a page number / size
  useEffect(() => {
    if (page > 1) {
      if (instances && instances.length === 0) {
        setSearchParam('page', (page - 1).toString());
        setSearchParam('perPage', perPage.toString());
        history.push({
          search: searchParams.toString(),
        });
      }
    }
  }, [page, perPage, instances]);

  const actionResolver = (rowData: IRowData) => {
    if (!dataLoaded) {
      return [];
    }
    const originalData: T = rowData.originalData;
    if (
      originalData.status === InstanceStatus.DEPROVISION ||
      originalData.status === InstanceStatus.DELETED
    ) {
      return [];
    }

    enum Action {
      VIEW_INSTANCE_DETAILS = 'view_instance_details',
      VIEW_CONNECTION_DETAILS = 'view_connection_details',
      DELETE_INSTANCE = 'delete_instance',
    }

    const buildAction = (action: Action) => {
      const onSelectKebabDropdownOption = (
        event: React.MouseEvent,
        action: Action
      ) => {
        if (isUserSameAsLoggedIn) {
          if (action === Action.VIEW_INSTANCE_DETAILS) {
            onViewInstance(originalData);
          } else if (action === Action.VIEW_CONNECTION_DETAILS) {
            onViewConnection(originalData);
          } else if (action === Action.DELETE_INSTANCE) {
            onSelectDeleteInstance(originalData);
          }
          // Set focus back on previous selected element i.e. kebab button
          const previousNode = (event?.target as Element).parentElement
            ?.parentElement?.previousSibling;
          if (previousNode !== undefined && previousNode !== null) {
            (previousNode as HTMLElement).focus();
          }
        }
      };

      const isUserSameAsLoggedIn =
        originalData.owner === loggedInUser || isOrgAdmin;
      const additionalProps = isUserSameAsLoggedIn
        ? {}
        : {
          tooltip: true,
          isDisabled: true,
          style: {
            pointerEvents: 'auto',
            cursor: 'default',
          },
        };
      return {
        title: t(action),
        id: action,
        ['data-testid']: `${config.id}-table-${action.toString()}`,
        onClick: (event) => onSelectKebabDropdownOption(event, action),
        ...additionalProps,
        tooltipProps: {
          position: 'left',
          content: t('no_permission_to_view'),
        },
      } as unknown as IAction;
    };

    return [
      buildAction(Action.VIEW_INSTANCE_DETAILS),
      buildAction(Action.VIEW_CONNECTION_DETAILS),
      buildAction(Action.DELETE_INSTANCE),
    ];
  };

  const createTableCells = () => {
    if (instances === undefined || !dataLoaded) {
      return getSkeletonForRows({
        loadingCount: getLoadingRowsCount(page, perPage, expectedTotal),
        skeleton: <Skeleton />,
        length: config.fields.length,
      });
    }
    return instances.map((instance) => {
      return {
        cells: config.fields.map((field) => {
          if (field.type === FieldType.NAME) {
            return {
              title: (
                <Link
                  to={`${getBasename && getBasename()}/${instance.id}`}
                  data-testid='tableStreams-linkKafka'
                >
                  {instance[field.key]}
                </Link>
              ),
            };
          } else if (field.type === FieldType.STATUS) {
            return {
              title: (
                <StatusColumn
                  status={instance[field.key]}
                  instanceName={instance.name}
                />
              ),
            };
          } else if (field.type === FieldType.DATE) {
            return {
              title: getFormattedDate(instance[field.key], t('ago')),
            };
          }
          return instance[field.key];
        }),
        originalData: instance,
      };
    });
  };

  const onSelectDeleteInstance = (instance: T) => {
    const deleteInstance = async (instance: T) => {
      await onDelete(instance);
      hideModal();
    };

    const { status, name } = instance;
    if (status === InstanceStatus.FAILED) {
      deleteInstance(instance);
    } else {
      const { title, confirmActionLabel, description } =
        getDeleteInstanceModalConfig(t, status, name, isMaxCapacityReached);

      showModal(KAFKA_MODAL_TYPES.DELETE_KAFKA_INSTANCE, {
        instanceStatus: status,
        selectedItemData: instance,
        title,
        confirmButtonProps: {
          onClick: deleteInstance,
          label: confirmActionLabel,
        },
        textProps: {
          description,
        },J
      });
    }
  };

  const onSort: OnSort = (_event, index, direction, extraData) => {
    let myDirection = direction;
    if (sortBy()?.index !== index && extraData.property === 'time-created') {
      // trick table to sort descending first for date column
      // https://github.com/patternfly/patternfly-react/issues/5329
      myDirection = SortByDirection.desc;
    }
    setOrderBy(`${config.fields[index].key} ${myDirection}`);
  };

  const sortBy = (): ISortBy | undefined => {
    const sort: string[] = orderBy?.split(' ') || [];
    if (sort.length > 1) {
      return {
        index: config.fields.findIndex((f) => f.key === sort[0]),
        direction:
          sort[1] === SortByDirection.asc
            ? SortByDirection.asc
            : SortByDirection.desc,
      };
    }
    return;
  };

  const onRowClick = (event: MouseEvent, rowIndex: number, row: IRowData) => {
    const { originalData } = row;
    const clickedEventType = (event?.target as HTMLButtonElement).type;
    const tagName = (event?.target as Element).tagName;

    // Open modal on row click except kebab button click
    if (clickedEventType !== 'button' && tagName?.toLowerCase() !== 'a') {
      onViewInstance(originalData);
    }
  };

  return (
    <>
      <ServiceToolbar
        total={total}
        page={page}
        perPage={perPage}
        filter={filter}
        setFilter={setFilter}
        isDisabledCreateButton={isDisabledCreateButton}
        buttonTooltipContent={buttonTooltipContent}
        labelWithTooltip={labelWithTooltip}
        openCreateModal={openCreateModal}
        config={config}
      />
      <MASTable
        tableProps={{
          cells: config.fields.map((field) => {
            return {
              title: field.label,
              transforms: field.columnTransforms,
            };
          }),
          rows: createTableCells(),
          'aria-label': t('cluster_instance_list'),
          actionResolver,
          onSort,
          sortBy,
          hasDefaultCustomRowWrapper: true,
        }}
        onRowClick={onRowClick}
        rowDataTestId='tableStreams-row'
        loggedInUser={loggedInUser}
      />
      {instances && instances.length < 1 && dataLoaded && (
        <ServiceTableEmptyState />
      )}
      {total && total > 0 && (
        <MASPagination
          widgetId='pagination-options-menu-bottom'
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
export { ServiceTable };
