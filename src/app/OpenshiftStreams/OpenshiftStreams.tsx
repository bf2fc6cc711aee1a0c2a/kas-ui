import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Switch,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title,
  Drawer,
  DrawerContent
} from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequest } from '../../openapi/api';
import { AlertProvider } from '../components/Alerts/Alerts';
import { InstanceDrawer } from '../Drawer/InstanceDrawer';
import { AuthContext } from '@app/auth/AuthContext';
import { BASE_PATH } from '@app/common/app-config';
import { Loading } from '@app/components/Loading/Loading';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = () => {
  const { token } = useContext(AuthContext);

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH,
  });

  const { t } = useTranslation();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[] | undefined>();
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [mainToggle, setMainToggle] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance|null>();
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
    try {
      await apisService
        .listKafkas()
        .then((res) => {
          const kafkaInstances = res.data;
          console.log('what is res' + JSON.stringify(kafkaInstances));
          // setKafkaInstancesList(kafkaInstances);
          setKafkaInstanceItems(kafkaInstances.items);
        })
        .then(() => setTimeout(fetchKafkas, 2000));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token !== '') {
      setKafkaDataLoaded(false);
      fetchKafkas().then(() => setKafkaDataLoaded(true));
    }
  }, [token]);

  if (token === '') {
    return <Loading />;
  }

  if (!kafkaDataLoaded) {
    return <Loading />;
  }

  const handleSwitchChange = (checked: boolean) => {
    setMainToggle(checked);
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
                      {t('OpenshiftStreams')}
                    </Title>
                  </LevelItem>
                  <LevelItem>
                    <Switch
                      id="simple-switch"
                      label={t('Mock UI')}
                      labelOff={t('Currently supported UI')}
                      isChecked={mainToggle}
                      onChange={handleSwitchChange}
                    />
                  </LevelItem>
                </Level>
              </PageSection>
              <PageSection>
                {kafkaInstanceItems && kafkaInstanceItems.length > 0 ? (
                  <StreamsTableView
                    createStreamsInstance={createStreamsInstance}
                    setCreateStreamsInstance={setCreateStreamsInstance}
                    onConnectToInstance={onConnectInstance}
                    onViewInstance={onViewInstance}
                    kafkaInstanceItems={kafkaInstanceItems}
                    mainToggle={mainToggle}
                    refresh={fetchKafkas}
                  />
                ) : (
                  kafkaInstanceItems !== undefined && (
                    <EmptyState
                      createStreamsInstance={createStreamsInstance}
                      setCreateStreamsInstance={setCreateStreamsInstance}
                      mainToggle={mainToggle}
                    />
                  )
                )}
                {createStreamsInstance && (
                  <CreateInstanceModal
                    createStreamsInstance={createStreamsInstance}
                    setCreateStreamsInstance={setCreateStreamsInstance}
                    mainToggle={mainToggle}
                    refresh={fetchKafkas}
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
