import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  VoidFunctionComponent,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertVariant,
  Card,
  PageSection,
  PageSectionVariants,
} from "@patternfly/react-core";
import { usePagination } from "@app/common";
import { useInterval } from "@app/hooks/useInterval";
import {
  ErrorCodes,
  InstanceStatus,
  isServiceApiError,
  MAX_POLL_INTERVAL,
} from "@app/utils";
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
import { FederatedProps, useFederated } from "@app/contexts";
import "@app/modules/styles.css";
import {
  FilterType,
  KafkaEmptyState,
  Unauthorized,
} from "@app/modules/OpenshiftStreams/components";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import {
  KafkaRequestWithSize,
  StreamsTable,
} from "@app/modules/OpenshiftStreams/components/StreamsTable/StreamsTable";
import { useKafkaStatusAlerts } from "./useKafkaStatusAlerts";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { useKafkaSizeMemoized } from "./useKafkaSizeMemoized";

export type StreamsTableProps = Pick<FederatedProps, "preCreateInstance">;

export const StreamsTableConnected: VoidFunctionComponent<
  StreamsTableProps
> = ({ preCreateInstance }: StreamsTableProps) => {
  const { shouldOpenCreateModal } = useFederated() || {};
  const getKafkaSizes = useKafkaSizeMemoized();

  const auth = useAuth();
  const { kas } = useConfig() || {};
  const { apiBasePath: basePath } = kas || {};
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const { page = 1, perPage = 10, setPage } = usePagination() || {};
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const { addAlert } = useAlert() || {};
  const { showModal: showCreateModal } =
    useModal<ModalType.KasCreateInstance>();
  const { showModal: showTransferOwnershipModal } =
    useModal<ModalType.KasTransferOwnership>();
  const { hideModal: hideDeleteModal, showModal: showDeleteModal } =
    useModal<ModalType.KasDeleteInstance>();

  const history = useHistory();

  const {
    drawerInstance,
    closeDrawer,
    openDrawer,
    setDrawerActiveTab,
    setDrawerInstance,
  } = useInstanceDrawer();

  // Kafka list state
  const [kafkaInstancesList, setKafkaInstancesList] = useState<
    KafkaRequestList | undefined
  >();
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [expectedTotal, setExpectedTotal] = useState<number>(3);
  const [kafkaItems, setKafkaItems] = useState<KafkaRequestWithSize[]>();

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

  const [shouldRefresh, setShouldRefresh] = useState(false);

  useKafkaStatusAlerts(
    kafkaInstancesList?.items?.filter((i) => i.owner === loggedInUser)
  );

  const kafkaSizes = useCallback(getKafkaSizes, [getKafkaSizes]);

  const fetchKafkaSizeAndMergeWithKafkaRequest = useCallback(
    async (
      kafkaItems: KafkaRequestWithSize[]
    ): Promise<KafkaRequestWithSize[]> => {
      const kafkaItemsWithSize: KafkaRequestWithSize[] = [...kafkaItems];

      if (kafkaItemsWithSize && kafkaItemsWithSize.length > 0) {
        kafkaItemsWithSize?.forEach(
          async (instance: KafkaRequest, index: number) => {
            const { instance_type, cloud_provider, region } = instance;

            if (instance_type === "developer" && cloud_provider && region) {
              const size = await kafkaSizes(cloud_provider, region);
              kafkaItemsWithSize[index]["size"] = {
                trialDurationHours: size.trial.trialDurationHours!,
              };
            }
          }
        );
      }

      return kafkaItemsWithSize;
    },
    [kafkaSizes]
  );

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
    setDrawerInstance(instance.id!);
    setDrawerActiveTab(InstanceDrawerTab.DETAILS);
    openDrawer();
  };

  const onViewConnection = (instance: KafkaRequest) => {
    setDrawerInstance(instance.id!);
    setDrawerActiveTab(InstanceDrawerTab.CONNECTION);
    openDrawer();
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
  const fetchKafkas = useCallback(
    async (isPolling = false) => {
      const filterQuery = getFilterQuery();
      const accessToken = await auth?.kas.getToken();

      if (accessToken) {
        try {
          const apisService = new DefaultApi(
            new Configuration({
              accessToken,
              basePath,
            })
          );

          if (!isPolling) {
            setKafkaDataLoaded(false);
          }
          setShouldRefresh(false);

          await apisService
            .getKafkas(
              page?.toString(),
              perPage?.toString(),
              orderBy,
              filterQuery
            )
            .then(async (res) => {
              const kafkaInstances = res.data;
              const kafkaItems: KafkaRequestWithSize[] =
                kafkaInstances?.items || [];
              setKafkaInstancesList(kafkaInstances);

              const kafkaItemsWithSize: KafkaRequestWithSize[] =
                await fetchKafkaSizeAndMergeWithKafkaRequest(kafkaItems);
              setKafkaItems(kafkaItemsWithSize);

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
            })
            .finally(() => setKafkaDataLoaded(true));
        } catch (error) {
          handleServerError(error);
        }
      }
    },
    [
      auth,
      basePath,
      expectedTotal,
      filteredValue,
      getFilterQuery,
      kafkaInstancesList,
      orderBy,
      page,
      perPage,
      waitingForDelete,
      fetchKafkaSizeAndMergeWithKafkaRequest,
    ]
  );

  const onSearch = useCallback(
    (filter: FilterType[]) => {
      setFilteredValue(filter);
      setPage && setPage(1);
    },
    [setPage]
  );

  const refreshKafkasAfterAction = useCallback(() => {
    setShouldRefresh(true);
  }, []);

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

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current === false || shouldRefresh) {
      mounted.current = true;
      fetchKafkas();
    }
  }, [fetchKafkas, shouldRefresh]);

  // refresh the data when interacting with the UI in a way that will make the displayed data change
  useEffect(() => {
    refreshKafkasAfterAction();
  }, [
    page,
    perPage,
    orderBy,
    searchParams,
    refreshKafkasAfterAction,
    filteredValue,
  ]);

  useEffect(() => {
    // close the drawer if the selected instance isn't visible in the list
    if (
      kafkaInstancesList !== undefined &&
      kafkaInstancesList?.size > 0 &&
      drawerInstance
    ) {
      const selectedKafkaItem = kafkaInstancesList.items?.find(
        (kafka) => kafka?.id === drawerInstance?.id
      );
      if (selectedKafkaItem === undefined) {
        closeDrawer();
      }
    }
  }, [
    closeDrawer,
    drawerInstance,
    drawerInstance?.id,
    kafkaInstancesList,
    openDrawer,
  ]);

  useEffect(() => {
    if (kafkaInstancesList?.size === 0) {
      closeDrawer();
    }
  }, [kafkaInstancesList, closeDrawer]);

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

  const pollKafkas = useCallback(
    function pollKafkasCb() {
      fetchKafkas(true);
    },
    [fetchKafkas]
  );
  useInterval(pollKafkas, MAX_POLL_INTERVAL);

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
        data-ouia-component-id={"page-KafkaInstances"}
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
            kafkaInstanceItems={kafkaItems}
            setOrderBy={setOrderBy}
            setFilterSelected={setFilterSelected}
            setFilteredValue={onSearch}
            filteredValue={filteredValue}
            handleCreateInstanceModal={handleCreateInstanceModal}
            orderBy={orderBy}
            filterSelected={filterSelected}
            onCreate={onCreate}
            refresh={refreshKafkasAfterAction}
            selectedInstanceName={drawerInstance?.name}
          />
        </Card>
      </PageSection>
    );
  }
  return <></>;
};
