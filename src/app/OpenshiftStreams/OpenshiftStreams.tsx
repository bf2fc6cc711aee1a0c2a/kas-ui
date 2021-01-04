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
  Switch,
  Title,
  AlertVariant,
} from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequest, KafkaRequestList, CloudProviderList, CloudProvider } from '../../openapi/api';
import { AlertProvider } from '../components/Alerts/Alerts';
import { InstanceDrawer } from '../Drawer/InstanceDrawer';
import { AuthContext } from '@app/auth/AuthContext';
import { Loading } from '@app/components/Loading/Loading';
import { ApiContext } from '@app/api/ApiContext';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError } from '@app/utils/error';
import { cloudProviderOptions, cloudRegionOptions, statusOptions } from '@app/utils/utils';
import './OpenshiftStreams.css';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = parseInt(searchParams.get('page') || '', 10) || 1;
  const perPage = parseInt(searchParams.get('perPage') || '', 10) || 10;

  const { t } = useTranslation();
  const { addAlert } = useAlerts();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[] | undefined>();
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [mainToggle, setMainToggle] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance | null>();
  const [expectedTotal, setExpectedTotal] = useState<number>(0); // state to store the expected total kafka instances based on the operation
  const [rawKafkaDataLength, setRawKafkaDataLength] = useState<number>(0);
  const [orderBy, setOrderBy] = useState("");
  const [filterSelected, setFilterSelected] = useState('Name');
  const [filteredValue, setFilteredValue] = useState(
    { name: '',
    status: '',
    region: cloudRegionOptions[0].label,
    cloud_provider: cloudProviderOptions[0].label,
    owner: ''}
  );

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

  // Functions
  const fetchKafkas = async () => {
    const accessToken = await authContext?.getToken();

    if (isValidToken(accessToken)) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listKafkas(
          page?.toString(),
          perPage?.toString(),
          orderBy && orderBy,
          `${filteredValue.name && `name = ${filteredValue.name} and `}
          ${filteredValue.status && `status = ${statusOptions[statusOptions.findIndex(x => x.label === filteredValue.status)].value} and `}
          ${filteredValue.region && ` region = ${cloudRegionOptions[cloudRegionOptions.findIndex(x => x.label === filteredValue.region)].value}`}
          ${filteredValue.owner && ` and owner = ${filteredValue.owner}`}
          ${filteredValue.cloud_provider && ` and cloud_provider = ${cloudProviderOptions[cloudProviderOptions.findIndex(x => x.label === filteredValue.cloud_provider)].value}`}`
        ).then((res) => {
          const kafkaInstances = res.data;
          setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaInstances.items);
          kafkaInstancesList?.total !== undefined &&
            kafkaInstancesList.total > expectedTotal &&
            setExpectedTotal(kafkaInstancesList.total);
          setKafkaDataLoaded(true);
        });
      // Check to see if at least 1 kafka is present
      await apisService.listKafkas(
        page?.toString(),
        perPage?.toString(),
        orderBy && orderBy,
        `region = ${cloudRegionOptions[0].value} and cloud_provider = ${cloudProviderOptions[0].value}`
      ).then((res) => {
        setRawKafkaDataLength(res.data.items.length);
      })
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
    fetchKafkas();
  }, [authContext, page, perPage, filteredValue]);

  useEffect(() => {
    fetchCloudProviders();
    fetchKafkas();
  }, []);

  useTimeout(fetchKafkas, 5000);

  const handleSwitchChange = (checked: boolean) => {
    setMainToggle(checked);
  };

  const refreshKafkas = (value: string) => {
    //set the page to laoding state
    setKafkaDataLoaded(false);
    if (value === 'create') {
      /*
        increase the expected total by 1
        as create operation will lead to adding a kafka in the list of response
      */
      setExpectedTotal(kafkaInstancesList.total + 1);
    } else if (value === 'delete') {
      /*
        decrease the expected total by 1
        as create operation will lead to removing a kafka in the list of response
      */
      setExpectedTotal(kafkaInstancesList.total - 1);
    }
    fetchKafkas();
  };

  return (
    <>
      <AlertProvider>
        <Drawer isExpanded={selectedInstance != null} onExpand={onExpand}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                mainToggle={mainToggle}
                onClose={onCloseClick}
                isExpanded={selectedInstance != null}
                drawerRef={drawerRef}
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
                <LevelItem>
                  <Switch
                    id="simple-switch"
                    label={t('mock_ui')}
                    labelOff={t('currently_supported_ui')}
                    isChecked={mainToggle}
                    onChange={handleSwitchChange}
                  />
                </LevelItem>
              </Level>
            </PageSection>
            {kafkaInstanceItems === undefined ? (
              <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
                <Loading />
              </PageSection>
            ) : rawKafkaDataLength && rawKafkaDataLength < 1 ? (
              <PageSection>
                <EmptyState
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  mainToggle={mainToggle}
                />
              </PageSection>
            ) : (
              <PageSection className="mk--main-page__page-section--table" variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
                <StreamsTableView
                  kafkaInstanceItems={kafkaInstanceItems}
                  mainToggle={mainToggle}
                  onViewConnection={onViewConnection}
                  onViewInstance={onViewInstance}
                  onConnectToInstance={onConnectToInstance}
                  refresh={refreshKafkas}
                  kafkaDataLoaded={kafkaDataLoaded}
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
                />
              </PageSection>
            )}
            {createStreamsInstance && (
              <CreateInstanceModal
                createStreamsInstance={createStreamsInstance}
                setCreateStreamsInstance={setCreateStreamsInstance}
                cloudProviders={cloudProviders}
                mainToggle={mainToggle}
                refresh={refreshKafkas}
              />
            )}
          </DrawerContent>
        </Drawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
