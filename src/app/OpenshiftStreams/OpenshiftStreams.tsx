import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Level, LevelItem, PageSection, PageSectionVariants, Title, AlertVariant } from '@patternfly/react-core';
import {
  StreamsTableView,
  FilterType,
  CreateInstanceModal,
  AlertProvider,
  useAlerts,
  InstanceDrawer,
} from '@app/components';
import { DefaultApi, KafkaRequest, KafkaRequestList, CloudProvider } from '../../openapi/api';
import { AuthContext } from '@app/auth/AuthContext';
import { ApiContext } from '@app/api/ApiContext';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError, ErrorCodes } from '@app/utils';
import './OpenshiftStreams.css';
import { MASLoading, MASEmptyState, MASFullPageError } from '@app/common';

export type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
  getConnectToInstancePath: (data: KafkaRequest) => string;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance, getConnectToInstancePath }: OpenShiftStreamsProps) => {
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
  const [isUserUnauthorized, setIsUserUnauthorized] = useState<boolean>(false);

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
      addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
    }
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
            setRawKafkaDataLength(res.data.items.length);
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

  /**
   * Show Unathorize page in case user is not authorize
   */
  if (isUserUnauthorized) {
    return (
      <MASFullPageError
        titleProps={{
          title: t('you_do_not_have_access_to_openshift_streams'),
          headingLevel: 'h2',
        }}
        emptyStateBodyProps={{
          body: t('contact_your_organization_administration_for_more_information'),
        }}
      />
    );
  }

  return (
    <>
      <AlertProvider>
        <InstanceDrawer
          mainToggle={mainToggle}
          isExpanded={selectedInstance != null}
          activeTab={activeTab}
          isLoading={instanceDetail === undefined}
          instanceDetail={instanceDetail}
          onClose={onCloseDrawer}          
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
                getConnectToInstancePath={getConnectToInstancePath}
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
                orderBy={orderBy}
                setOrderBy={setOrderBy}
                isDrawerOpen={selectedInstance!==null}
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
        </InstanceDrawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
