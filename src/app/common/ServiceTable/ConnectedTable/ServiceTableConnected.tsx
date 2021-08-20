import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import { Card, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useTimeout } from '@app/hooks/useTimeout';
import { InstanceStatus, InstanceType, MAX_POLL_INTERVAL } from '@app/utils';
import { usePageVisibility } from '@app/hooks/usePageVisibility';
import '../../../modules/KasTableView/KasTableView.css';
import { useKasTableConfig } from '@app/modules/KasTable/streams';
import { CreateInstanceLabel } from '@app/common/ServiceTable/ConnectedTable/CreateInstanceLabel';
import {
  InstanceBaseProps,
  ServiceStatus,
  ServiceTable,
} from '@app/common/ServiceTable/Table';
import { List } from '@app/common/ServiceTable/Table/service';
import { useRootModalContext } from '@app/common';
import { usePrevious } from '@app/common/ServiceTable/Table/utils';
import { FilterTypes } from '@app/common/ServiceTable/Toolbar';
import { ServiceTableConnectedEmptyState } from '@app/common/ServiceTable/ConnectedTable/ServiceTableConnectedEmptyState';
import { InstanceDrawerTabs } from '@app/modules/InstanceDrawer/InstanceDrawerContent';
import { useAuth } from '@rhoas/app-services-ui-shared';

export type ServiceTableConnectedProps<
  I extends InstanceBaseProps,
  T extends List<I>
> = {
  onOpenCreateModal: (userHasTrialInstances: boolean, onCreated: () => void) => void;
  onSelectInstance: (selectedInstance: SelectedInstance<I> | undefined) => void;
  getInstances: (
    page?: string,
    size?: string,
    orderBy?: string,
    search?: string
  ) => Promise<T>;
  deleteInstance: (id: string) => Promise<void>;
};

export type SelectedInstance<T> = {
  instanceDetail: T;
  activeTab: InstanceDrawerTabs;
};

export const ServiceTableConnected = <
  I extends InstanceBaseProps,
  T extends List<I>
>({
    getInstances,
    deleteInstance,
    onOpenCreateModal,
    onSelectInstance,
  }: PropsWithChildren<ServiceTableConnectedProps<I, T>>): React.ReactElement => {
  dayjs.extend(localizedFormat);
  const { isVisible } = usePageVisibility();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const kasTableConfig = useKasTableConfig();
  const modal = useRootModalContext();

  // States
  const [instances, setInstances] = useState<T | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [orderBy, setOrderBy] = useState<string>('created_at desc');
  const [selectedInstance, setSelectedInstance] = useState<
    SelectedInstance<I> | undefined
  >();
  // state to store the expected total instances based on the operation
  const [expectedTotal, setExpectedTotal] = useState<number | undefined>(
    undefined
  );
  const [filteredValue, setFilteredValue] = useState<FilterTypes>({});
  const [waitingForDelete, setWaitingForDelete] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(
    undefined
  );
  const previousModalStore = usePrevious(modal.store);
  const { getUsername } = useAuth() || {};
  const userHasTrialInstances = instances?.items?.some((k) => k?.instance_type === InstanceType?.eval) || false;

  // Function to pre-empt the number of instances for Skeleton Loading in the table (add 1)
  const onCreate = () => {
    setExpectedTotal(instances?.size || 0 + 1);
  };

  const handleCreateInstanceModal = async () => {
    onOpenCreateModal(userHasTrialInstances,() => {
      if (!(instances?.size && instances.size >= 1)) {
        setLoaded(false);
      }
      onCreate();
      fetchInstances();
    });
  };

  useEffect(() => {
    const fetchUsername = async () => {
      if (getUsername) {
        const username = await getUsername();
        setLoggedInUser(username);
      }
    };
    fetchUsername();
  }, [getUsername]);

  const onViewInstance = (instance: I) => {
    const selectedInstance = {
      instanceDetail: instance,
      activeTab: InstanceDrawerTabs.DETAILS,
    } as SelectedInstance<I>;
    setSelectedInstance(selectedInstance);
    onSelectInstance(selectedInstance);
  };

  const onViewConnection = (instance: I) => {
    const selectedInstance = {
      instanceDetail: instance,
      activeTab: InstanceDrawerTabs.CONNECTION,
    } as SelectedInstance<I>;
    setSelectedInstance(selectedInstance);
    onSelectInstance(selectedInstance);
  };

  const buildSearch = () => {
    const filters: string[] = [];
    Object.entries(filteredValue).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue.length > 0) {
        let filterQuery = '(';
        filterQuery += filterValue
          .map((val) => {
            const value = val.value.trim();
            if (value === InstanceStatus.PROVISIONING) {
              return `${filterKey} = ${InstanceStatus.PREPARING} or ${filterKey} = ${InstanceStatus.PROVISIONING}`;
            }
            if (value === InstanceStatus.DEPROVISION) {
              return `${filterKey} = ${InstanceStatus.DEPROVISION} or ${filterKey} = ${InstanceStatus.DELETED}`;
            }
            return value !== ''
              ? `${filterKey} ${
                val.isExact === true ? `= ${value}` : `like %${value}%`
              }`
              : '';
          })
          .join(' or ');
        filterQuery += ')';

        filters.push(filterQuery);
      }
    });
    return filters.join(' and ');
  };

  // Functions
  const fetchInstances = async () => {
    if (isVisible) {
      const filterQuery = buildSearch();

      const instances = await getInstances(
        page?.toString(),
        perPage?.toString(),
        orderBy,
        filterQuery
      );
      setInstances(instances);
      setExpectedTotal(instances.total);

      if (
        waitingForDelete &&
        Object.keys(filteredValue).length < 1 &&
        instances.size == 0
      ) {
        setWaitingForDelete(false);
      }

      if (selectedInstance !== undefined) {
        instances?.items
          ?.filter((v) => v.id === selectedInstance?.instanceDetail?.id)
          .forEach((instance) => {
            setSelectedInstance((prevState) => {
              return prevState === undefined
                ? undefined
                : { ...prevState, instanceDetail: instance };
            });
          });
      }

      setLoaded(true);
    }
  };

  useEffect(() => {
    setLoaded(false);
    fetchInstances();
  }, [page, perPage, filteredValue, orderBy]);

  useEffect(() => {
    // TODO we need a better way to interact with modal changes e.g. to set the expected number of lines
    if (
      previousModalStore &&
      previousModalStore.modalType !== '' &&
      modal.store.modalType === ''
    ) {
      setLoaded(false);
      fetchInstances();
    }
  }, [modal.store]);

  useEffect(() => {
    setLoaded(false);
    fetchServiceStatus();
    fetchInstances();
  }, []);

  useTimeout(() => fetchInstances(), MAX_POLL_INTERVAL);

  // Function to pre-empt the number of instances for Skeleton Loading in the table (delete 1)
  const onDelete = async (instance: I) => {
    if (instance.id === undefined) {
      throw new Error('id must be defined');
    }
    await deleteInstance(instance.id);
    setLoaded(false);
    setExpectedTotal(instances?.size || 0 - 1);
    await fetchInstances();
  };

  const firstInstance = instances?.items?.find(
    (instance) => instance.owner === loggedInUser
  );

  const isEmptyState =
    loaded &&
    ((instances?.size || 0) < 1 ||
      (waitingForDelete &&
        Object.keys(filteredValue).length < 1 &&
        instances?.size == 0));

  if (isEmptyState) {
    return (
      <PageSection padding={{ default: 'noPadding' }} isFilled>
        <ServiceTableConnectedEmptyState
          instanceExists={firstInstance !== undefined}
          createButtonDisabled={
            isMaxCapacityReached || firstInstance !== undefined
          }
          maxCapacityReached={isMaxCapacityReached || false}
          handleCreateInstanceModal={handleCreateInstanceModal}
        />
      </PageSection>
    );
  } else {
    return (
      <PageSection
        className='mk--main-page__page-section--table pf-m-padding-on-xl'
        variant={PageSectionVariants.default}
        padding={{ default: 'noPadding' }}
      >
        <Card>
          <ServiceTable
            instances={instances?.items}
            onViewConnection={onViewConnection}
            onViewInstance={onViewInstance}
            dataLoaded={loaded}
            setWaitingForDelete={setWaitingForDelete}
            onDelete={onDelete}
            page={page}
            perPage={perPage}
            total={instances?.total}
            expectedTotal={expectedTotal || 0}
            filter={filteredValue}
            setFilter={setFilteredValue}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            loggedInUser={loggedInUser}
            isMaxCapacityReached={isMaxCapacityReached}
            // PLM TODO Fix this
            buttonTooltipContent={''}
            isDisabledCreateButton={
              firstInstance !== undefined || isMaxCapacityReached
            }
            labelWithTooltip={
              <CreateInstanceLabel
                maxCapacityReached={isMaxCapacityReached || false}
              />
            }
            openCreateModal={handleCreateInstanceModal}
            config={kasTableConfig}
          />
        </Card>
      </PageSection>
    );
  }
  return <></>;
};
