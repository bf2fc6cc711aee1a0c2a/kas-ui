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
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { DefaultApi, KafkaRequest } from '../../openapi/api';
import { AlertProvider } from '../components/Alerts/Alerts';
import { InstanceDrawer } from '../Drawer/InstanceDrawer';
import { AuthContext } from '@app/auth/AuthContext';
import { Loading } from '@app/components/Loading/Loading';
import { ApiContext } from '@app/api/ApiContext';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError } from '@app/utils/error';
import './OpenshiftStreams.css';
import { useStoreContext, types } from '@app/context-state-reducer';
import { RootModal } from '@app/components/RootModal';

export type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const { state, dispatch } = useStoreContext();
  const { kafkaInstanceItems, kafkaInstancesList, cloudProviders, expectedTotal, filteredValue, orderBy } =
    state && state.openshift_state;
  const modal = state && state.modal;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;
  const mainToggle = searchParams.has('user-testing');

  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance | null>();
  const [rawKafkaDataLength, setRawKafkaDataLength] = useState<number>(0);
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

  const isModalOpen = () => {
    if (modal.modalType != null) {
      return true;
    }
    return false;
  };
  // Functions
  const fetchKafkas = async (justPoll: boolean) => {
    const accessToken = await authContext?.getToken();

    if (isValidToken(accessToken) && !isModalOpen()) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService
          .listKafkas(page?.toString(), perPage?.toString(), orderBy && orderBy, getFilterString())
          .then((res) => {
            const kafkaInstances = res.data;
            dispatch({ type: types.UPDATE_KAFKA_INSTANCE_LIST, payload: kafkaInstances });
            dispatch({ type: types.UPDATE_KAFKA_INSTANCE_ITEMS, payload: kafkaInstances.items });
            kafkaInstancesList?.total !== undefined &&
              kafkaInstancesList.total > expectedTotal &&
              dispatch({ type: types.UPDATE_EXPECTED_TOTAL, payload: kafkaInstances.total });
            dispatch({ type: types.UPDATE_KAFKA_DATA_LOADED, payload: true });
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
    if (cloudProviders.length < 1) {
      if (accessToken !== undefined && accessToken !== '') {
        try {
          const apisService = new DefaultApi({
            accessToken,
            basePath,
          });
          await apisService.listCloudProviders().then((res) => {
            const providers = res.data;
            dispatch({ type: types.UPDATE_CLOUD_PROVIDERS, payload: providers.items });
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
    }
  };

  useEffect(() => {
    dispatch({ type: types.UPDATE_KAFKA_DATA_LOADED, payload: false });
    fetchKafkas(true);
  }, [authContext, page, perPage, filteredValue, orderBy]);

  useEffect(() => {
    fetchCloudProviders();
    fetchKafkas(false);
  }, []);

  useTimeout(() => fetchKafkas(true), 5000);

  const refreshKafkas = () => {
    //set the page to laoding state
    fetchKafkas(true);
  };

  return (
    <>
      <AlertProvider>
        <RootModal />
        <Drawer isExpanded={selectedInstance != null} onExpand={onExpand}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                mainToggle={mainToggle}
                onClose={onCloseClick}
                isExpanded={selectedInstance != null}
                activeTab={selectedInstance?.activeTab}
                instanceDetail={selectedInstance?.instanceDetail}
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
                <Loading />
              </PageSection>
            ) : rawKafkaDataLength && rawKafkaDataLength < 1 ? (
              <PageSection>
                <EmptyState refresh={refreshKafkas} mainToggle={mainToggle} />
              </PageSection>
            ) : (
              <PageSection
                className="mk--main-page__page-section--table"
                variant={PageSectionVariants.light}
                padding={{ default: 'noPadding' }}
              >
                <StreamsTableView
                  mainToggle={mainToggle}
                  onViewConnection={onViewConnection}
                  onViewInstance={onViewInstance}
                  onConnectToInstance={onConnectToInstance}
                  refresh={refreshKafkas}
                  page={page}
                  perPage={perPage}
                />
              </PageSection>
            )}
          </DrawerContent>
        </Drawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
