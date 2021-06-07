import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import {
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  TextContent,
  Text,
  AlertVariant,
  Alert,
  Button,
  ButtonVariant,
  Tooltip,
  EmptyStateVariant,
  TitleSizes,
  Label,
  Modal,
  ModalVariant,
  Card,
} from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';
import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import { useRootModalContext, MODAL_TYPES } from '@app/common';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError, ErrorCodes, isMobileTablet, InstanceStatus } from '@app/utils';
import { MASLoading, MASEmptyState } from '@app/common';
import { usePageVisibility } from '@app/hooks/usePageVisibility';
import { MAX_POLL_INTERVAL } from '@app/utils';
import { QuickStartContext, QuickStartContextValues } from '@cloudmosaic/quickstarts';
import { StreamsTableView, FilterType, InstanceDrawer, InstanceDrawerProps, StreamsTableProps } from './components';
import { DefaultApi, KafkaRequest, KafkaRequestList, CloudProvider, Configuration } from '@rhoas/kafka-management-sdk';
import './OpenshiftStreams.css';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';

export type OpenShiftStreamsProps = Pick<InstanceDrawerProps, 'tokenEndPointUrl'> &
  Pick<StreamsTableProps, 'onConnectToRoute' | 'getConnectToRoutePath'> & {
    preCreateInstance: (open: boolean) => Promise<boolean>;
    createDialogOpen: () => boolean;
  };

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams: React.FunctionComponent<OpenShiftStreamsProps> = ({
  onConnectToRoute,
  getConnectToRoutePath,
  preCreateInstance,
  tokenEndPointUrl,
}: OpenShiftStreamsProps) => {
  dayjs.extend(localizedFormat);

  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { isVisible } = usePageVisibility();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const { showModal } = useRootModalContext();
  const localStorage = window.localStorage;
  const qsContext: QuickStartContextValues = React.useContext(QuickStartContext);

  // States
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[] | undefined>();
  const [kafkas, setKafkas] = useState<KafkaRequest[] | undefined>();
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [orderBy, setOrderBy] = useState<string>('created_at desc');
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance | null>();
  // state to store the expected total kafka instances based on the operation
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [isDisplayKafkaEmptyState, setIsDisplayKafkaEmptyState] = useState<boolean | undefined>(undefined);
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [waitingForDelete, setWaitingForDelete] = useState<boolean>(false);
  const [isMaxCapacityReached, setIsMaxCapacityReached] = useState<boolean | undefined>(undefined);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(undefined);
  const [currentUserKafkas, setCurrentUserKafkas] = useState<KafkaRequest[] | undefined>();

  const { activeTab, instanceDetail } = selectedInstance || {};

  const updateSelectedKafkaInstance = () => {
    if (kafkaInstanceItems && kafkaInstanceItems?.length > 0) {
      const selectedKafkaItem = kafkaInstanceItems?.filter(
        (kafka) => kafka?.id === selectedInstance?.instanceDetail?.id
      )[0];
      const newState: any = { ...selectedInstance, instanceDetail: selectedKafkaItem };
      selectedKafkaItem && setSelectedInstance(newState);
    }
  };

  const fetchKafkaServiceStatus = async () => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        await apisService.getServiceStatus().then((res) => {
          const maxCapacityReached = res?.data?.kafkas?.max_capacity_reached || mainToggle;
          setIsMaxCapacityReached(maxCapacityReached);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    if (isMobileTablet()) {
      if (localStorage) {
        const count = parseInt(localStorage.getItem('openSessions') || '0');
        const newCount = count + 1;
        if (count < 1) {
          localStorage.setItem('openSessions', `${newCount}`);
          setIsMobileModalOpen(true);
        }
      }
    }
  }, []);

  const handleMobileModal = () => {
    setIsMobileModalOpen(!isMobileModalOpen);
  };

  const handleCreateInstanceModal = async (open: boolean) => {
    if (open) {
      // Callback before opening create dialog
      // The callback can override the new state of opening
      open = await preCreateInstance(open);
    }
    open &&
      showModal(MODAL_TYPES.CREATE_KAFKA_INSTANCE, {
        onCreate,
        cloudProviders,
        mainToggle,
        refresh: refreshKafkas,
      });
  };

  const onCloseDrawer = () => {
    setSelectedInstance(null);
  };

  const onViewInstance = (instance: KafkaRequest) => {
    setSelectedInstance({ instanceDetail: instance, activeTab: 'Details' });
  };

  const onViewConnection = (instance: KafkaRequest) => {
    setSelectedInstance({ instanceDetail: instance, activeTab: 'Connection' });
  };

  const getFilterString = () => {
    const filters: string[] = [];
    filteredValue.forEach((filter) => {
      const { filterKey, filterValue } = filter;
      if (filterValue && filterValue.length > 0) {
        filters.push(
          filterValue
            .map((val) => {
              const value = val.value.trim();
              if (value === InstanceStatus.PROVISIONING) {
                return `${filterKey} = ${InstanceStatus.PREPARING} or ${filterKey} = ${InstanceStatus.PROVISIONING}`;
              }
              if (value === InstanceStatus.DEPROVISION) {
                return `${filterKey} = ${InstanceStatus.DEPROVISION} or ${filterKey} = ${InstanceStatus.DELETED}`;
              }
              return value !== '' ? `${filterKey} ${val.isExact === true ? `= ${value}` : `like %${value}%`}` : '';
            })
            .join(' or ')
        );
      }
    });
    return filters.join(' or ');
  };

  const handleServerError = (error: Error) => {
    let reason: string | undefined;
    let errorCode: string | undefined;
    if (isServiceApiError(error)) {
      reason = error.response?.data.reason;
      errorCode = error.response?.data?.code;
    }
    //check unauthorize user
    if (errorCode === ErrorCodes.UNAUTHORIZED_USER) {
      setIsUserUnauthorized(true);
    } else {
      addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
    }
  };

  // Functions
  const fetchKafkas = async () => {
    const accessToken = await auth?.kas.getToken();

    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        await apisService.getKafkas(page?.toString(), perPage?.toString(), orderBy, getFilterString()).then((res) => {
          const kafkaInstances = res.data;
          const kafkaItems = kafkaInstances?.items || [];
          setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaItems);

          if (kafkaInstancesList?.total !== undefined && kafkaInstancesList.total > expectedTotal) {
            setExpectedTotal(kafkaInstancesList.total);
          }

          if (waitingForDelete && filteredValue.length < 1 && kafkaItems?.length == 0) {
            setIsDisplayKafkaEmptyState(true);
            setWaitingForDelete(false);
          }

          setKafkaDataLoaded(true);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const fetchSingleKafka = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        await apisService.getKafkas('1', '1').then((res) => {
          const kafkaItemsLength = res?.data?.items?.length;
          if (!kafkaItemsLength || kafkaItemsLength < 1) {
            setIsDisplayKafkaEmptyState(true);
          } else {
            setIsDisplayKafkaEmptyState(false);
          }
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    if (!kafkaInstanceItems || kafkaInstanceItems?.length <= 1) {
      fetchSingleKafka();
    }
  }, [kafkaInstanceItems]);

  const fetchCurrentUserKafkas = async () => {
    const accessToken = await auth?.kas.getToken();
    const filter = `owner = ${loggedInUser}`;
    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getKafkas('', '', '', filter).then((res) => {
          const kafkaInstances = res.data;
          setCurrentUserKafkas(kafkaInstances.items);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  useEffect(() => {
    loggedInUser && fetchCurrentUserKafkas();
  }, [loggedInUser]);

  useTimeout(() => fetchCurrentUserKafkas(), MAX_POLL_INTERVAL);

  /**
   * Todo:remove after summit
   */
  const fetchKafkasOnborading = async () => {
    const accessToken = await auth?.kas.getToken();
    const filter = loggedInUser ? `owner = ${loggedInUser}` : '';
    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getKafkas('1', '1', '', filter).then((res) => {
          const kafkaInstances = res.data;
          setKafkas(kafkaInstances.items);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const fetchCloudProviders = async () => {
    const accessToken = await auth?.kas.getToken();
    if (accessToken) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getCloudProviders().then((res) => {
          const providers = res?.data?.items || [];
          const enabledCloudProviders: CloudProvider[] = providers?.filter((p: CloudProvider) => p.enabled);
          setCloudProviders(enabledCloudProviders);
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert({ variant: AlertVariant.danger, title: t('common.something_went_wrong'), description: reason });
      }
    }
  };

  useEffect(() => {
    setKafkaDataLoaded(false);
    fetchKafkas();
  }, [auth, page, perPage, filteredValue, orderBy]);

  useEffect(() => {
    fetchCloudProviders();
    fetchKafkas();
  }, []);

  /**
   * Todo:remove after summit
   */
  useEffect(() => {
    fetchKafkasOnborading();
  }, []);

  useEffect(() => {
    updateSelectedKafkaInstance();
  }, [kafkaInstanceItems]);

  useEffect(() => {
    auth?.getUsername().then((username) => setLoggedInUser(username));
  }, [auth]);

  useEffect(() => {
    fetchKafkaServiceStatus();
  }, []);

  useTimeout(() => fetchKafkasOnborading(), MAX_POLL_INTERVAL);

  useTimeout(() => fetchKafkas(), MAX_POLL_INTERVAL);

  const refreshKafkas = () => {
    //set the page to laoding state
    if (kafkaInstanceItems && kafkaInstanceItems?.length === 1) {
      setKafkaDataLoaded(true);
    } else {
      setKafkaDataLoaded(false);
    }
    fetchKafkas();
  };

  // Function to pre-empt the number of kafka instances for Skeleton Loading in the table (add 1)
  const onCreate = () => {
    setExpectedTotal(kafkaInstancesList.total + 1);
  };

  // Function to pre-empt the number of kafka instances for Skeleton Loading in the table (delete 1)
  const onDelete = () => {
    setKafkaDataLoaded(false);
    setExpectedTotal(kafkaInstancesList.total - 1);
  };

  if (isUserUnauthorized) {
    return (
      <PageSection variant={PageSectionVariants.default} padding={{ default: 'noPadding' }} isFilled>
        <MASEmptyState
          titleProps={{ title: t('access_permissions_needed'), headingLevel: 'h2' }}
          emptyStateIconProps={{
            icon: LockIcon,
          }}
          emptyStateBodyProps={{ body: t('to_access_kafka_instances_contact_your_organization_administrators') }}
        />
      </PageSection>
    );
  }

  /**
   * Todo: remove after summit
   */
  const getLoggedInUserKafkaInstance = () => {
    let kafkaItem: KafkaRequest | undefined = kafkaInstanceItems?.filter((kafka) => kafka.owner === loggedInUser)[0];
    if (!kafkaItem) {
      kafkaItem = kafkas?.filter((kafka) => kafka.owner === loggedInUser)[0];
    }
    return kafkaItem;
  };

  /**
   * Todo: remove after summit
   */
  const renderAlertMessage = () => {
    const kafka = getLoggedInUserKafkaInstance();
    if (kafka) {
      return (
        <Alert
          variant="info"
          isInline
          title={`${kafka?.name} was created on ${dayjs(kafka?.created_at).format('LLLL')}`}
          className="pf-u-mt-lg"
        >
          This preview instance will expire 48 hours after creation.
        </Alert>
      );
    }
    return <></>;
  };

  /**
   * Todo: remove after summit
   */
  const getButtonTooltipContent = () => {
    const isKafkaInstanceExist = getLoggedInUserKafkaInstance() !== undefined;
    const isDisabledCreateButton = isKafkaInstanceExist || isMaxCapacityReached;
    let content = '';
    if (isDisabledCreateButton) {
      if (isMaxCapacityReached && isKafkaInstanceExist) {
        content = 'You can deploy 1 preview instance at a time.';
      } else if (isMaxCapacityReached) {
        content = 'Development preview instances are currently unavailable for creation.';
      } else {
        content = 'You can deploy 1 preview instance at a time.';
      }
    }
    return content;
  };

  const createInstanceButton = () => {
    const isKafkaInstanceExist = getLoggedInUserKafkaInstance() !== undefined;
    const isDisabledCreateButton = isKafkaInstanceExist || isMaxCapacityReached;
    if (isDisabledCreateButton) {
      const content = getButtonTooltipContent();
      return (
        <Tooltip content={content}>
          <Button
            data-testid="emptyStateStreams-buttonCreateKafka"
            variant={ButtonVariant.primary}
            onClick={() => handleCreateInstanceModal(true)}
            isAriaDisabled={isDisabledCreateButton}
          >
            {t('create_kafka_instance')}
          </Button>
        </Tooltip>
      );
    }
    return (
      <Button
        data-testid="emptyStateStreams-buttonCreateKafka"
        variant={ButtonVariant.primary}
        onClick={() => handleCreateInstanceModal(true)}
      >
        {t('create_kafka_instance')}
      </Button>
    );
  };

  /**
   * Todo: remove after summit
   */
  const getLabelTooltipContent = () => {
    let content = '';
    if (isMaxCapacityReached) {
      content = 'Development preview instances are currently unavailable for creation.';
    } else {
      content =
        'Development preview instances are available for creation. You can deploy 1 preview instance at a time.';
    }
    return content;
  };

  /**
   * Todo: remove after summit
   */
  const createInstanceLabel = () => {
    const content = getLabelTooltipContent();
    if (isMaxCapacityReached) {
      return (
        <Tooltip content={content}>
          <Label icon={<BanIcon />} className="pf-u-ml-md" tabIndex={0}>
            No instances available
          </Label>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip content={content}>
          <Label color="green" icon={<CheckIcon />} className="pf-u-ml-md" tabIndex={0}>
            Instances available
          </Label>
        </Tooltip>
      );
    }
  };

  const renderStreamsTable = () => {
    if (kafkaInstanceItems === undefined) {
      return (
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <MASLoading />
        </PageSection>
      );
    } else if (isDisplayKafkaEmptyState) {
      return (
        <PageSection padding={{ default: 'noPadding' }} isFilled>
          {isMaxCapacityReached ? (
            <MASEmptyState
              emptyStateProps={{
                variant: EmptyStateVariant.large,
              }}
              emptyStateIconProps={{
                icon: BanIcon,
              }}
              emptyStateBodyProps={{
                body: (
                  <>
                    Development preview instances are currently unavailable for creation, so check back later. In the
                    meantime,{' '}
                    <Button variant={ButtonVariant.link} isSmall isInline data-testid="emptyState-actionTour">
                      take a tour
                    </Button>{' '}
                    to learn more about the service.
                  </>
                ),
              }}
              titleProps={{ title: 'Kafka instances unavailable', size: TitleSizes.xl, headingLevel: 'h2' }}
            ></MASEmptyState>
          ) : (
            <MASEmptyState
              emptyStateProps={{
                variant: EmptyStateVariant.large,
              }}
              emptyStateIconProps={{
                icon: CheckCircleIcon,
                color: 'green',
              }}
              emptyStateBodyProps={{
                body: (
                  <>
                    Development preview instances are available for creation. For help getting started, access the{' '}
                    <Button
                      variant={ButtonVariant.link}
                      isSmall
                      isInline
                      onClick={() => qsContext.setActiveQuickStart && qsContext.setActiveQuickStart('getting-started')}
                    >
                      quick start guide.
                    </Button>
                  </>
                ),
              }}
              titleProps={{ title: 'Kafka instances available', size: TitleSizes.xl, headingLevel: 'h2' }}
            >
              {createInstanceButton()}
            </MASEmptyState>
          )}
        </PageSection>
      );
    } else if (kafkaInstanceItems && isDisplayKafkaEmptyState !== undefined) {
      return (
        <PageSection
          className="mk--main-page__page-section--table pf-m-padding-on-xl"
          variant={PageSectionVariants.default}
          padding={{ default: 'noPadding' }}
        >
          <Card>
            <StreamsTableView
              kafkaInstanceItems={kafkaInstanceItems}
              mainToggle={mainToggle}
              onViewConnection={onViewConnection}
              onViewInstance={onViewInstance}
              onConnectToRoute={onConnectToRoute}
              getConnectToRoutePath={getConnectToRoutePath}
              refresh={refreshKafkas}
              kafkaDataLoaded={kafkaDataLoaded}
              setWaitingForDelete={setWaitingForDelete}
              onDelete={onDelete}
              page={page}
              perPage={perPage}
              total={kafkaInstancesList?.total}
              expectedTotal={expectedTotal}
              filteredValue={filteredValue}
              setFilteredValue={setFilteredValue}
              setFilterSelected={setFilterSelected}
              filterSelected={filterSelected}
              orderBy={orderBy}
              setOrderBy={setOrderBy}
              isDrawerOpen={selectedInstance !== null}
              loggedInUser={loggedInUser}
              isMaxCapacityReached={isMaxCapacityReached}
              buttonTooltipContent={getButtonTooltipContent()}
              isDisabledCreateButton={getLoggedInUserKafkaInstance() !== undefined || isMaxCapacityReached}
              labelWithTooltip={createInstanceLabel()}
              currentUserkafkas={currentUserKafkas}
              onCreate={onCreate}
              cloudProviders={cloudProviders}
            />
          </Card>
        </PageSection>
      );
    }
    return <></>;
  };

  return (
    <>
      <InstanceDrawer
        mainToggle={mainToggle}
        isExpanded={selectedInstance != null}
        activeTab={activeTab}
        isLoading={instanceDetail === undefined}
        instanceDetail={instanceDetail}
        onClose={onCloseDrawer}
        data-ouia-app-id="controlPlane-streams"
        getConnectToRoutePath={getConnectToRoutePath}
        onConnectToRoute={onConnectToRoute}
        tokenEndPointUrl={tokenEndPointUrl}
        notRequiredDrawerContentBackground={isDisplayKafkaEmptyState}
      >
        <main className="pf-c-page__main">
          <PageSection variant={PageSectionVariants.light}>
            <Level>
              <LevelItem>
                <TextContent>
                  <Text component="h1">{t('kafka_instances')}</Text>
                </TextContent>
              </LevelItem>
            </Level>
            {renderAlertMessage()}
          </PageSection>
          {renderStreamsTable()}
        </main>
      </InstanceDrawer>
      <Modal
        variant={ModalVariant.small}
        title="Mobile experience"
        isOpen={isMobileModalOpen}
        onClose={() => handleMobileModal()}
        actions={[
          <Button key="confirm" variant="primary" onClick={() => handleMobileModal()}>
            Ok
          </Button>,
        ]}
      >
        The mobile experience isn&apos;t fully optimized yet, so some items might not appear correctly.
      </Modal>
    </>
  );
};

export { OpenshiftStreams };
