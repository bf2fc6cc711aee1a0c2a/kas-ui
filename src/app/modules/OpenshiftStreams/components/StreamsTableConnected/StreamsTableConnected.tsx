import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import localizedFormat from "dayjs/plugin/localizedFormat";
// eslint-disable-next-line no-restricted-imports
import dayjs from "dayjs";
import {
  AlertVariant,
  Card,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import { usePagination } from "@app/common";
import { useTimeout } from "@app/hooks/useTimeout";
import {
  ErrorCodes,
  InstanceStatus,
  isServiceApiError,
  MAX_POLL_INTERVAL,
} from "@app/utils";
import { usePageVisibility } from "@app/hooks/usePageVisibility";
import {
  Configuration,
  DefaultApi,
  KafkaRequest,
  KafkaRequestList,
} from "@rhoas/kafka-management-sdk";
import "./StreamsTableConnected.css";
import {
  ModalType,
  useAlert,
  useAuth,
  useConfig,
  useModal,
} from "@rhoas/app-services-ui-shared";
import { useFederated } from "@app/contexts";
import "@app/modules/styles.css";
import {
  FilterType,
  KafkaEmptyState,
  Unauthorized,
} from "@app/modules/OpenshiftStreams/components";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { StreamsTable } from "@app/modules/OpenshiftStreams/components/StreamsTable/StreamsTable";
import { KafkaStatusAlerts } from "@app/modules/OpenshiftStreams/components/StreamsTableConnected/KafkaStatusAlerts";

export type StreamsTableProps = {
  preCreateInstance: (open: boolean) => Promise<boolean>;
};

export const StreamsTableConnected: FunctionComponent<StreamsTableProps> = ({
  preCreateInstance,
}: StreamsTableProps) => {
  dayjs.extend(localizedFormat);
  const { shouldOpenCreateModal } = useFederated() || {};

  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const { isVisible } = usePageVisibility();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const { page = 1, perPage = 10 } = usePagination() || {};
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const { addAlert } = useAlert() || {};
  const { showModal: showCreateModal } =
    useModal<ModalType.KasCreateInstance>();
  const { showModal: showTransferOwnershipModal } =
    useModal<ModalType.KasTransferOwnership>();
  const { hideModal: hideDeleteModal, showModal: showDeleteModal } =
    useModal<ModalType.KasDeleteInstance>();
  const {
    setInstanceDrawerTab,
    setInstanceDrawerInstance,
    instanceDrawerInstance,
    setNoInstances,
  } = useInstanceDrawer();
  const history = useHistory();

  // Kafka list state
  const [kafkaInstancesList, setKafkaInstancesList] = useState<
    KafkaRequestList | undefined
  >();
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [expectedTotal, setExpectedTotal] = useState<number>(3);

  // filter and sort state
  const [orderBy, setOrderBy] = useState<string>("created_at desc");
  const [filterSelected, setFilterSelected] = useState("name");
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);

  // user state
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(
    undefined
  );
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean>();

  // States to sort out
  const [waitingForDelete, setWaitingForDelete] = useState<boolean>(false);

  const handleCreateInstanceModal = async () => {
    let open;
    if (preCreateInstance) {
      // Callback before opening create dialog
      // The callback can override the new state of opening
      open = await preCreateInstance(true);
    }

    if (open) {
      openCreateModal();
    }
  };

  const onViewInstance = (instance: KafkaRequest) => {
    setInstanceDrawerInstance(instance);
    setInstanceDrawerTab(InstanceDrawerTab.DETAILS);
  };

  const onViewConnection = (instance: KafkaRequest) => {
    setInstanceDrawerInstance(instance);
    setInstanceDrawerTab(InstanceDrawerTab.CONNECTION);
  };

  const getFilterQuery = useCallback(() => {
    const filters: string[] = [];
    filteredValue.forEach((filter) => {
      const { filterKey, filterValue } = filter;
      if (filterValue && filterValue.length > 0) {
        let filterQuery = "(";
        filterQuery += filterValue
          .map((val) => {
            const value = val.value.trim();
            if (value === InstanceStatus.PROVISIONING) {
              return `${filterKey} = ${InstanceStatus.PREPARING} or ${filterKey} = ${InstanceStatus.PROVISIONING}`;
            }
            if (value === InstanceStatus.DEPROVISION) {
              return `${filterKey} = ${InstanceStatus.DEPROVISION} or ${filterKey} = ${InstanceStatus.DELETED}`;
            }
            return value !== ""
              ? `${filterKey} ${
                  val.isExact === true ? `= ${value}` : `like %${value}%`
                }`
              : "";
          })
          .join(" or ");
        filterQuery += ")";

        filters.push(filterQuery);
      }
    });
    return filters.join(" and ");
  }, [filteredValue]);

  const handleServerError = (error: unknown) => {
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      errorCode = error.response?.data?.code;
    }
    //check unauthorize user
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    }
  };

  // Functions
  const fetchKafkas = useCallback(async () => {
    const filterQuery = getFilterQuery();
    const accessToken = await auth?.kas.getToken();

    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        await apisService
          .getKafkas(
            page?.toString(),
            perPage?.toString(),
            orderBy,
            filterQuery
          )
          .then((res) => {
            const kafkaInstances = res.data;
            const kafkaItems = kafkaInstances?.items || [];
            setKafkaInstancesList(kafkaInstances);

            if (
              kafkaInstancesList?.total !== undefined &&
              kafkaInstancesList.total > expectedTotal
            ) {
              setExpectedTotal(kafkaInstancesList.total);
            }

            if (
              waitingForDelete &&
              filteredValue.length < 1 &&
              kafkaItems?.length == 0
            ) {
              setWaitingForDelete(false);
            }

            setKafkaDataLoaded(true);
          });
      } catch (error) {
        handleServerError(error);
      }
    }
  }, [
    auth,
    basePath,
    expectedTotal,
    filteredValue.length,
    getFilterQuery,
    isVisible,
    kafkaInstancesList,
    orderBy,
    page,
    perPage,
    waitingForDelete,
  ]);

  const refreshKafkasAfterAction = useCallback(() => {
    //set the page to laoding state
    if (kafkaInstancesList?.size === 1) {
      setKafkaDataLoaded(true);
    } else {
      setKafkaDataLoaded(false);
    }
    fetchKafkas();
  }, [fetchKafkas, kafkaInstancesList]);

  // Function to pre-empt the number of kafka instances for Skeleton Loading in the table (add 1)
  const onCreate = useCallback(() => {
    setExpectedTotal(
      (kafkaInstancesList === undefined ? 0 : kafkaInstancesList.total) + 1
    );
  }, [kafkaInstancesList]);

  const openCreateModal = useCallback(() => {
    showCreateModal(ModalType.KasCreateInstance, {
      onCreate: () => {
        onCreate();
        refreshKafkasAfterAction();
      },
    });
  }, [onCreate, refreshKafkasAfterAction, showCreateModal]);

  // Function to pre-empt the number of kafka instances for Skeleton Loading in the table (delete 1)
  const onDelete = () => {
    setKafkaDataLoaded(false);
    setExpectedTotal(
      (kafkaInstancesList === undefined ? 0 : kafkaInstancesList.total) - 1
    );
  };

  const setSearchParam = useCallback(
    (name: string, value: string) => {
      searchParams.set(name, value.toString());
    },
    [searchParams]
  );

  const onChangeOwner = async (instance: KafkaRequest) => {
    showTransferOwnershipModal(ModalType.KasTransferOwnership, {
      kafka: instance,
      refreshKafkas: refreshKafkasAfterAction,
    });
  };

  const onDeleteInstance = async (kafka: KafkaRequest) => {
    const doDelete = async () => {
      await deleteInstance(kafka);
      onDelete();
    };
    if (kafka.status === InstanceStatus.FAILED) {
      await doDelete();
    } else {
      showDeleteModal(ModalType.KasDeleteInstance, {
        onDelete: doDelete,
        kafka,
      });
    }
  };

  const deleteInstance = async (instance: KafkaRequest) => {
    /**
     * Throw an error if kafka id is not set
     * and avoid delete instanceDrawerInstance api call
     */
    if (instance.id === undefined) {
      throw new Error("kafka instanceDrawerInstance id is not set");
    }
    const accessToken = await auth?.kas.getToken();
    const apisService = new DefaultApi(
      new Configuration({
        accessToken,
        basePath,
      })
    );
    onDelete();
    hideDeleteModal();

    try {
      await apisService.deleteKafkaById(instance.id, true).then(() => {
        setWaitingForDelete(true);
        refreshKafkasAfterAction();
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
          title: t("common.something_went_wrong"),
          variant: AlertVariant.danger,
          description: reason,
        });
    }
  };

  // Redirect the user to a previous page if there are no kafka instances for a page number / size
  useEffect(() => {
    if (page > 1) {
      if (
        kafkaInstancesList?.items !== undefined &&
        kafkaInstancesList.size === 0
      ) {
        setSearchParam("page", (page - 1).toString());
        setSearchParam("perPage", perPage.toString());
        history.push({
          search: searchParams.toString(),
        });
      }
    }
  }, [
    history,
    kafkaInstancesList,
    page,
    perPage,
    searchParams,
    setSearchParam,
  ]);

  useEffect(() => {
    setKafkaDataLoaded(false);
    fetchKafkas();
  }, [auth, page, perPage, filteredValue, orderBy, fetchKafkas]);

  useEffect(() => {
    if (kafkaInstancesList !== undefined && kafkaInstancesList?.size > 0) {
      const selectedKafkaItem = kafkaInstancesList.items?.find(
        (kafka) => kafka?.id === instanceDrawerInstance?.id
      );
      if (selectedKafkaItem !== undefined) {
        setInstanceDrawerInstance(selectedKafkaItem);
      }
    }
  }, [instanceDrawerInstance, kafkaInstancesList, setInstanceDrawerInstance]);

  useEffect(() => {
    setNoInstances(kafkaInstancesList?.size === 0);
  }, [kafkaInstancesList, setNoInstances]);

  useEffect(() => {
    auth.getUsername()?.then((username) => setLoggedInUser(username));
    auth.isOrgAdmin()?.then((isOrgAdmin) => setIsOrgAdmin(isOrgAdmin));
  }, [auth]);

  useEffect(() => {
    const openModal = async () => {
      const shouldOpen =
        shouldOpenCreateModal && (await shouldOpenCreateModal());
      if (shouldOpen) {
        openCreateModal();
      }
    };
    openModal();
  }, [openCreateModal, shouldOpenCreateModal]);

  useTimeout(() => fetchKafkas(), MAX_POLL_INTERVAL);

  if (isUserUnauthorized) {
    return <Unauthorized />;
  }

  const isDisplayKafkaEmptyState =
    kafkaDataLoaded &&
    filteredValue.length < 1 &&
    kafkaInstancesList !== undefined &&
    kafkaInstancesList?.total < 1;

  if (isDisplayKafkaEmptyState) {
    return (
      <KafkaEmptyState handleCreateInstanceModal={handleCreateInstanceModal} />
    );
  } else if (isDisplayKafkaEmptyState !== undefined) {
    return (
      <PageSection
        className="mk--main-page__page-section--table pf-m-padding-on-xl"
        variant={PageSectionVariants.default}
        padding={{ default: "noPadding" }}
      >
        <Card ouiaId="card-controlplane">
          <StreamsTable
            onDeleteInstance={onDeleteInstance}
            onViewInstance={onViewInstance}
            onViewConnection={onViewConnection}
            onChangeOwner={onChangeOwner}
            loggedInUser={loggedInUser}
            page={page}
            perPage={perPage}
            total={kafkaInstancesList?.total || 0}
            isOrgAdmin={isOrgAdmin}
            expectedTotal={expectedTotal}
            kafkaDataLoaded={kafkaDataLoaded}
            kafkaInstanceItems={kafkaInstancesList?.items}
            setOrderBy={setOrderBy}
            setFilterSelected={setFilterSelected}
            setFilteredValue={setFilteredValue}
            filteredValue={filteredValue}
            handleCreateInstanceModal={handleCreateInstanceModal}
            orderBy={orderBy}
            filterSelected={filterSelected}
            onCreate={onCreate}
            refresh={refreshKafkasAfterAction}
          />
        </Card>
        <KafkaStatusAlerts />
      </PageSection>
    );
  }
  return <></>;
};
