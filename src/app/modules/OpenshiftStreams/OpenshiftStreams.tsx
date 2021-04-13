import React, { useContext, useEffect, useState } from 'react';
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
  Banner,
  Alert,
  Button,
  ButtonVariant,
  Tooltip,
} from '@patternfly/react-core';
import {
  StreamsTableView,
  FilterType,
  CreateInstanceModal,
  InstanceDrawer,
  CreateInstanceModalProvider,
} from './components';
import { AlertProvider, useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { DefaultApi, KafkaRequest, KafkaRequestList, CloudProvider } from '../../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError, ErrorCodes } from '@app/utils';
import './OpenshiftStreams.css';
import { MASLoading, MASEmptyState, MASFullPageError, MASEmptyStateVariant } from '@app/common';
import { usePageVisibility } from '@app/hooks/usePageVisibility';
import { MAX_POLL_INTERVAL } from '@app/utils';

export type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
  preCreateInstance: (open: boolean) => Promise<boolean>;
  createDialogOpen: () => boolean;
  getConnectToInstancePath: (data: KafkaRequest) => string;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({
  onConnectToInstance,
  getConnectToInstancePath,
  preCreateInstance,
  createDialogOpen,
}: OpenShiftStreamsProps) => {
  dayjs.extend(localizedFormat);

  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { isVisible } = usePageVisibility();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');

  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  // States
  const [isOpenCreateInstanceModalState, setIsOpenCreateInstanceModalState] = useState(createDialogOpen());
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[] | undefined>();
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [orderBy, setOrderBy] = useState<string>('created_at desc');
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance | null>();
  const [expectedTotal, setExpectedTotal] = useState<number>(0); // state to store the expected total kafka instances based on the operation
  const [rawKafkaDataLength, setRawKafkaDataLength] = useState<number>(0);
  const [filterSelected, setFilterSelected] = useState('name');
  const [filteredValue, setFilteredValue] = useState<FilterType[]>([]);
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);
  const [isMaxCapacityReached, setIsMaxCapacityReached] = useState<boolean | undefined>(undefined);
  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(undefined);
  const [notRequiredDrawerContentBackground, setNotRequiredDrawerContentBackground] = useState<boolean | undefined>(
    false
  );

  useEffect(() => {
    authContext?.getUsername().then((username) => setLoggedInUser(username));
  }, []);

  useEffect(() => {
    fetchKafkaServiceStatus();
  }, []);

  const fetchKafkaServiceStatus = async () => {
    const accessToken = await authContext?.getToken();

    if (accessToken) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });

        await apisService.serviceStatus().then((res) => {
          const maxCapacityReached = res?.data?.kafkas?.max_capacity_reached || mainToggle;
          setIsMaxCapacityReached(maxCapacityReached);
        });
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const setIsOpenCreateInstanceModal = async (open: boolean) => {
    if (open) {
      // Callback before opening create dialog
      // The callback can override the new state of opening
      open = await preCreateInstance(open);
    }
    setIsOpenCreateInstanceModalState(open);
  };

  const { activeTab, instanceDetail } = selectedInstance || {};

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
              if (value === 'provisioning') {
                return `${filterKey} = preparing or ${filterKey} = provisioning`;
              }
              return value !== '' ? `${filterKey} ${val.isExact === true ? `= ${value}` : `like %${value}%`}` : '';
            })
            .join(' or ')
        );
      }
    });
    return filters.join(' or ');
  };

  const handleServerError = (error: any) => {
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
      addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
    }
  };

  // Functions
  const fetchKafkas = async (justPoll: boolean) => {
    const accessToken = await authContext?.getToken();

    if (accessToken && isVisible) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listKafkas(page?.toString(), perPage?.toString(), orderBy, getFilterString()).then((res) => {
          const kafkaInstances = res.data;
          setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaInstances.items);
          kafkaInstancesList?.total !== undefined &&
            kafkaInstancesList.total > expectedTotal &&
            setExpectedTotal(kafkaInstancesList.total);
          setKafkaDataLoaded(true);
        });
        // only if we are not just polling the kafka
        if (!justPoll) {
          // Check to see if at least 1 kafka is present
          await apisService.listKafkas('1', '1').then((res) => {
            const kafkaItemsLength = res?.data?.items?.length;
            setRawKafkaDataLength(kafkaItemsLength);
            kafkaItemsLength < 1 && setNotRequiredDrawerContentBackground(true);
          });
        }
      } catch (error) {
        handleServerError(error);
      }
    }
  };

  const fetchCloudProviders = async () => {
    const accessToken = await authContext?.getToken();
    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listCloudProviders().then((res) => {
          const providers = res.data;
          setCloudProviders(providers.items);
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
        addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
      }
    }
  };

  useEffect(() => {
    setKafkaDataLoaded(false);
    fetchKafkas(true);
  }, [authContext, page, perPage, filteredValue, orderBy]);

  useEffect(() => {
    fetchCloudProviders();
    fetchKafkas(false);
  }, []);

  useTimeout(() => fetchKafkas(true), MAX_POLL_INTERVAL);

  const refreshKafkas = () => {
    //set the page to laoding state
    setKafkaDataLoaded(false);
    fetchKafkas(false);
  };

  const onCreate = () => {
    /*
        increase the expected total by 1
        as create operation will lead to adding a kafka in the list of response
      */
    setExpectedTotal(kafkaInstancesList.total + 1);
  };

  const onDelete = () => {
    setKafkaDataLoaded(false);
    /*
        decrease the expected total by 1
        as create operation will lead to removing a kafka in the list of response
      */
    setExpectedTotal(kafkaInstancesList.total - 1);
  };

  /**
   * Show Unathorize page in case user is not authorize
   */
  if (isUserUnauthorized) {
    return (
      <MASFullPageError
        titleProps={{
          title: t('access_permissions_needed'),
          headingLevel: 'h2',
        }}
        emptyStateBodyProps={{
          body: t('to_access_kafka_instances_contact_your_organization_administrators'),
        }}
      />
    );
  }

  /**
   * This is Onboarding changes
   * Todo: remove this change after public eval
   */
  const getBannerMessage = () => {
    const isUserSameAsLoggedIn = getLoggedInUserKafkaInstance() !== undefined;
    if (isMaxCapacityReached) {
      if (isUserSameAsLoggedIn) {
        return 'Instances are currently unavailable for creation.';
      } else {
        return (
          <>
            Instances are currently unavailable for creation, so check back later to see if any become available. In the
            meantime,{' '}
            <Button
              variant={ButtonVariant.link}
              isSmall
              isInline
              data-testid="bannerStreams-actionTour"
              className="mk--openstreams__banner"
            >
              take a tour
            </Button>{' '}
            to learn more about the service.
          </>
        );
      }
    } else {
      if (isUserSameAsLoggedIn) {
        return 'Instances are available for creation. You can deploy 1 instance at a time.';
      } else {
        return (
          <>
            Instances are available for creation. For help getting started, access the{' '}
            <Button variant={ButtonVariant.link} isSmall isInline className="mk--openstreams__banner">
              quick start guide.
            </Button>
          </>
        );
      }
    }
  };

  const renderBanner = () => {
    return (
      <>
        {kafkaInstanceItems && (
          <Banner isSticky variant={isMaxCapacityReached ? 'warning' : 'info'}>
            {getBannerMessage()}
          </Banner>
        )}
      </>
    );
  };

  /**
   * This is Onboarding changes
   * Todo: remove this change after public eval
   */
  const getLoggedInUserKafkaInstance = () => {
    const kafkaItem: KafkaRequest | undefined = kafkaInstanceItems?.filter((kafka) => kafka.owner === loggedInUser)[0];
    return kafkaItem;
  };

  /**
   * This is Onboarding changes
   * Todo: remove this change after public eval
   */
  const renderAlertMessage = () => {
    const kafka = getLoggedInUserKafkaInstance();
    if (kafka) {
      return (
        <Alert
          variant="info"
          isInline
          title={`${kafka?.name} was created on ${dayjs(kafka?.created_at).format('LLLL')}`}
        >
          This instance will expire 48 hours after creation
        </Alert>
      );
    }
    return <></>;
  };

  const getButtonTooltipContent = () => {
    const isKafkaInstanceExist = getLoggedInUserKafkaInstance() !== undefined;
    const isDisabledCreateButton = isKafkaInstanceExist || isMaxCapacityReached;
    let content = '';
    if (isDisabledCreateButton) {
      if (isMaxCapacityReached && isKafkaInstanceExist) {
        content = 'You can deploy 1 instance at a time.';
      } else if (isMaxCapacityReached) {
        content = 'Instances are currently unavailable for creation.';
      } else {
        content = 'You can deploy 1 instance at a time.';
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
            onClick={() => setIsOpenCreateInstanceModal(!isOpenCreateInstanceModalState)}
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
        onClick={() => setIsOpenCreateInstanceModal(!isOpenCreateInstanceModalState)}
      >
        {t('create_kafka_instance')}
      </Button>
    );
  };

  return (
    <>
      <AlertProvider>
        <CreateInstanceModalProvider
          value={{
            isModalOpen: isOpenCreateInstanceModalState,
            setIsModalOpen: setIsOpenCreateInstanceModal,
            onCreate,
            cloudProviders,
            mainToggle,
            refresh: refreshKafkas,
          }}
        >
          <InstanceDrawer
            mainToggle={mainToggle}
            isExpanded={selectedInstance != null}
            activeTab={activeTab}
            isLoading={instanceDetail === undefined}
            instanceDetail={instanceDetail}
            onClose={onCloseDrawer}
            data-ouia-app-id="controlPlane-streams"
            notRequiredDrawerContentBackground={notRequiredDrawerContentBackground}
          >
            {renderBanner()}
            <PageSection variant={PageSectionVariants.light}>
              <Level>
                <LevelItem>
                  <TextContent>
                    <Text component="h1">{t('kafka_instances')}</Text>
                  </TextContent>
                </LevelItem>
              </Level>
            </PageSection>
            {kafkaInstanceItems === undefined ? (
              <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
                <MASLoading />
              </PageSection>
            ) : rawKafkaDataLength && rawKafkaDataLength < 1 ? (
              <PageSection padding={{ default: 'noPadding' }} isFilled>
                <MASEmptyState
                  emptyStateProps={{
                    variant: MASEmptyStateVariant.NoItems,
                  }}
                  emptyStateBodyProps={{
                    body: t('create_a_kafka_instance_to_get_started'),
                  }}
                  titleProps={{ title: t('no_kafka_instances_yet') }}
                >
                  {createInstanceButton()}
                </MASEmptyState>
                <CreateInstanceModal />
              </PageSection>
            ) : (
              <PageSection
                className="mk--main-page__page-section--table"
                variant={PageSectionVariants.light}
                padding={{ default: 'noPadding' }}
              >
                {renderAlertMessage()}
                <StreamsTableView
                  kafkaInstanceItems={kafkaInstanceItems}
                  mainToggle={mainToggle}
                  onViewConnection={onViewConnection}
                  onViewInstance={onViewInstance}
                  onConnectToInstance={onConnectToInstance}
                  getConnectToInstancePath={getConnectToInstancePath}
                  refresh={refreshKafkas}
                  kafkaDataLoaded={kafkaDataLoaded}
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
                />
              </PageSection>
            )}
          </InstanceDrawer>
        </CreateInstanceModalProvider>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
