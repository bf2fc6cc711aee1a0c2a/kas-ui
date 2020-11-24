import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Switch,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title,
  Spinner,
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequestList, KafkaRequest } from '../../openapi/api';
import { Services } from '../common/app-config';
import { AlertProvider } from '../components/Alerts/Alerts';
import { InstanceDrawer } from '../TabSection/InstanceDrawer';
import { AuthContext } from '@app/auth/AuthContext';
import { BASE_PATH } from '@app/common/app-config';
import { Loading } from '@app/components/Loading';

type OpenShiftStreamsProps = {
  onConnectToInstance: (data: KafkaRequest) => void;
};

type SelectedInstance = {
  instanceDetail: KafkaRequest;
  activeTab: 'Details' | 'Connection';
};

const OpenshiftStreams = ({ onConnectToInstance }: OpenShiftStreamsProps) => {
  const { token } = useContext(AuthContext);

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
    basePath: BASE_PATH,
  });

  const { t } = useTranslation();

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequest[]>([]);
  const [kafkaDataLoaded, setKafkaDataLoaded] = useState(false);
  const [mainToggle, setMainToggle] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<SelectedInstance>();
  const drawerRef = React.createRef<any>();

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const onCloseClick = () => {
    setSelectedInstance(undefined);
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

        <Drawer isExpanded={selectedInstance !== undefined} onExpand={onExpand}>
          <DrawerContent
            panelContent={
              <InstanceDrawer
                onClose={onCloseClick}
                isExpanded={selectedInstance !== undefined}
                drawerRef={drawerRef}
                activeTab={selectedInstance?.activeTab}
                instanceDetail={selectedInstance?.instanceDetail}
              />
            }
          >
            <DrawerContentBody>
              <PageSection>
                {kafkaInstanceItems && kafkaInstanceItems.length > 0 ? (
                  <StreamsTableView
                    onConnectInstance={onConnectInstance}
                    onViewInstance={onViewInstance}
                    kafkaInstanceItems={kafkaInstanceItems}
                    mainToggle={mainToggle}
                  />
                ) : (
                  <EmptyState
                    createStreamsInstance={createStreamsInstance}
                    setCreateStreamsInstance={setCreateStreamsInstance}
                    mainToggle={mainToggle}
                  />
                )}
                {createStreamsInstance && (
                  <CreateInstanceModal
                    createStreamsInstance={createStreamsInstance}
                    setCreateStreamsInstance={setCreateStreamsInstance}
                    mainToggle={mainToggle}
                  />
                )}
              </PageSection>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
