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
import { DefaultApi, KafkaRequest, KafkaRequestList } from '../../openapi/api';
import { AlertProvider } from '../components/Alerts/Alerts';
import { InstanceDrawer } from '../Drawer/InstanceDrawer';
import { AuthContext } from '@app/auth/AuthContext';
import { Loading } from '@app/components/Loading/Loading';
import { ApiContext } from '@app/api/ApiContext';
import { useAlerts } from '@app/components/Alerts/Alerts';
import { useTimeout } from '@app/hooks/useTimeout';
import { isServiceApiError } from '@app/utils/error';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const { getToken } = useContext(AuthContext);
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
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [mainToggle, setMainToggle] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance | null>();


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

  const onConnectInstance = (instance: KafkaRequest) => {
    setSelectedInstance({ instanceDetail: instance, activeTab: 'Connection' });
  };

  // Functions
  const fetchKafkas = async () => {
    const accessToken = await getToken();

    if (accessToken !== undefined && accessToken !== '') {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listKafkas(page?.toString(), perPage?.toString()).then((res) => {
          const kafkaInstances = res.data;
          setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaInstances.items);
          setKafkaDataLoaded(true);
        });
      } catch (error) {
        let reason:string|undefined="";
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
  }, [getToken, page, perPage]);

  useEffect(() => {
    fetchKafkas();
  }, []);

  useTimeout(fetchKafkas, 5000);

  const handleSwitchChange = (checked: boolean) => {
    setMainToggle(checked);
  };

  const refreshKafkas = () => {
    setKafkaDataLoaded(false);
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
            <PageSection>
              {kafkaInstanceItems === undefined ? (
                <Loading />
              ) : kafkaInstanceItems.length < 1 ? (
                <EmptyState
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  mainToggle={mainToggle}
                />
              ) : (
                <StreamsTableView
                  kafkaInstanceItems={kafkaInstanceItems}
                  mainToggle={mainToggle}
                  onConnectToInstance={onConnectInstance}
                  onViewInstance={onViewInstance}
                  refresh={refreshKafkas}
                  kafkaDataLoaded={kafkaDataLoaded}
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  page={page}
                  perPage={perPage}
                  total={kafkaInstancesList?.total}
                />
              )}
              {createStreamsInstance && (
                <CreateInstanceModal
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  mainToggle={mainToggle}
                  refresh={refreshKafkas}
                />
              )}
            </PageSection>
          </DrawerContent>
        </Drawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
