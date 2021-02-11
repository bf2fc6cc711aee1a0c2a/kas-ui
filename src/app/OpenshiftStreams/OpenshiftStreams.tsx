import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title,
  AlertVariant,
} from '@patternfly/react-core';
import { StreamsTableView, FilterType, CreateInstanceModal, AlertProvider, useAlerts } from '@app/components';
import { DefaultApi, KafkaRequest, KafkaRequestList, CloudProvider } from '../../openapi/api';
import { InstanceDrawer } from '@app/components';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError } from '@app/utils/error';
import './OpenshiftStreams.css';
import { MASLoading, MASEmptyState,MASDrawer } from '@app/common';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

export type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  dayjs.extend(localizedFormat);

  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');

  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
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

  const drawerRef = React.createRef<any>();

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const onCloseClick = () => {
    setSelectedInstance(null);
  };

  const onViewInstance = (instance: KafkaRequest) => {
    setSelectedInstance({ instanceDetail: instance, activeTab: 'Details' });
  };

  const onViewConnection = (instance: KafkaRequest) => {
    setSelectedInstance({ instanceDetail: instance, activeTab: 'Connection' });
  };

  const isValidToken = (accessToken: string | undefined) => {
    if (accessToken !== undefined && accessToken !== '') {
      return true;
    }
    return false;
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

  // Functions
  const fetchKafkas = async (justPoll: boolean) => {
    const accessToken = await authContext?.getToken();

    if (isValidToken(accessToken)) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService
          .listKafkas(page?.toString(), perPage?.toString(), orderBy && orderBy, getFilterString())
          .then((res) => {
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
            setRawKafkaDataLength(res.data.items.length);
          });
        }
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
    }
  };

  // Functions
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
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
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

  useTimeout(() => fetchKafkas(true), 5000);

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

  const { activeTab, instanceDetail } = selectedInstance || {};
  const { id, created_at, updated_at, owner, name } = instanceDetail || {};

  const getExternalServer = () => {
    const { bootstrapServerHost } = instanceDetail || {};
    return bootstrapServerHost?.endsWith(':443') ? bootstrapServerHost : `${bootstrapServerHost}:443`;
  };

  return (
    <>
      <AlertProvider>
        <Drawer isExpanded={selectedInstance != null} onExpand={onExpand}>
          <DrawerContent
            panelContent={
              <MASDrawer                
                activeTab={activeTab}
                tabTitle1={t('details')}
                tabTitle2={t('connection')}
                onClose={onCloseClick}
                isLoading={instanceDetail === undefined}
                drawerHeaderProps={{
                  text: { label: t('instance_name') },
                  title: { value: name },
                }}
                detailsTabProps={{
                  textList: [
                    { label: t('cloud_provider'), value: t('amazon_web_services') },
                    { label: t('region'), value: t('us_east_north_virginia') },
                    { label: t('id'), value: id },
                    { label: t('owner'), value: owner },
                    { label: t('created'), value: dayjs(created_at).format('LLLL') },
                    { label: t('updated'), value: dayjs(updated_at).format('LLLL') },
                  ],
                  cardDetails: [
                    { title: t('topics'), value: 10 },
                    { title: t('consumer_groups'), value: 10 },
                  ],
                }}
                connectionTabProps={{
                  tabTitle1: t('resources'),
                  tabTitle2: t('sample_code'),
                }}
                instanceName={instanceDetail?.name}
                externalServer={getExternalServer()}
              />
            }
          >
            <PageSection variant={PageSectionVariants.light}>
              <Level>
                <LevelItem>
                  <Title headingLevel="h1" size="lg">
                    {t('openshift_streams')}
                  </Title>
                </LevelItem>
              </Level>
            </PageSection>
            {kafkaInstanceItems === undefined ? (
              <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
                <MASLoading />
              </PageSection>
            ) : rawKafkaDataLength && rawKafkaDataLength < 1 ? (
              <PageSection>
                <MASEmptyState
                  titleProps={{
                    title: t('you_do_not_have_any_kafka_instances_yet'),
                    headingLevel: 'h4',
                  }}
                  emptyStateBodyProps={{
                    body: t('create_a_kafka_instance_to_get_started'),
                  }}
                  buttonProps={{
                    title: t('create_a_kafka_instance'),
                    onClick: () => setCreateStreamsInstance(!createStreamsInstance),
                  }}
                />
              </PageSection>
            ) : (
              <PageSection
                className="mk--main-page__page-section--table"
                variant={PageSectionVariants.light}
                padding={{ default: 'noPadding' }}
              >
                <StreamsTableView
                  kafkaInstanceItems={kafkaInstanceItems}
                  mainToggle={mainToggle}
                  onViewConnection={onViewConnection}
                  onViewInstance={onViewInstance}
                  onConnectToInstance={onConnectToInstance}
                  refresh={refreshKafkas}
                  kafkaDataLoaded={kafkaDataLoaded}
                  onDelete={onDelete}
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  page={page}
                  perPage={perPage}
                  total={kafkaInstancesList?.total}
                  expectedTotal={expectedTotal}
                  filteredValue={filteredValue}
                  setFilteredValue={setFilteredValue}
                  setFilterSelected={setFilterSelected}
                  filterSelected={filterSelected}
                  // listOfOwners={listOfOwners}
                  orderBy={orderBy}
                  setOrderBy={setOrderBy}
                />
              </PageSection>
            )}
            <CreateInstanceModal
              createStreamsInstance={createStreamsInstance}
              setCreateStreamsInstance={setCreateStreamsInstance}
              onCreate={onCreate}
              cloudProviders={cloudProviders}
              mainToggle={mainToggle}
              refresh={refreshKafkas}
            />
          </DrawerContent>
        </Drawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
