import React, { useState, useContext, useEffect } from 'react';
import {
  Switch,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Button,
} from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Table } from '../components/Table/Table';
import { Modal } from '../components/Modal/Modal';
import { KafkaRequestList, KafkaRequestAllOf } from '../../openapi/api';
import { Services } from '../common/app-config';
import { InstanceDrawer } from '../TabSection/InstanceDrawer';
const OpenshiftStreams = () => {
  // Api Service
  const apisService = Services.getInstance().apiService;

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({});
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequestAllOf[]>([]); // Change this to 0 if you are working on the empty state
  const [mainToggle, setMainToggle] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const drawerRef = React.createRef<any>();

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const onCloseClick = () => {
    setIsDrawerExpanded(false);
  };

  useEffect(() => {
    fetchKafkas();
  }, []);

  // Functions
  const fetchKafkas = async () => {
    await apisService.listKafkas().then((res) => {
      const kafkaInstances = res.data;
      console.log('what is res' + JSON.stringify(kafkaInstances));
      setKafkaInstancesList(kafkaInstances);
      setKafkaInstanceItems(kafkaInstances.items);
    });
  };

  const handleSwitchChange = () => {
    setMainToggle(!mainToggle);
  };

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <span tabIndex={isDrawerExpanded ? 0 : -1} ref={drawerRef}>
          drawer-panel
        </span>
        <DrawerActions>
          <DrawerCloseButton onClick={onCloseClick} />
        </DrawerActions>
      </DrawerHead>
    </DrawerPanelContent>
  );
  const onClusterConnection = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1" size="lg">
              OpenshiftStreams
            </Title>
          </LevelItem>
          <LevelItem>
            <Switch
              id="simple-switch"
              label="Mock UI"
              labelOff="Currently supported UI"
              isChecked={mainToggle}
              onChange={() => handleSwitchChange()}
            />
          </LevelItem>
        </Level>
      </PageSection>

      <Drawer isExpanded={isDrawerExpanded} onExpand={onExpand}>
        <DrawerContent
          panelContent={
            <InstanceDrawer
              onClose={onCloseClick}
              isExpanded={isDrawerExpanded}
              drawerRef={drawerRef}
              instanceName={'Peanuts'}
              instanceDetail={{}}
            />
          }
        >
          <DrawerContentBody>
            <PageSection>
              <Button onClick={onClusterConnection}>Click</Button>
              {kafkaInstanceItems.length > 0 ? (
                <Table kafkaInstanceItems={kafkaInstanceItems} mainToggle={mainToggle} />
              ) : (
                <EmptyState
                  createStreamsInstance={createStreamsInstance}
                  setCreateStreamsInstance={setCreateStreamsInstance}
                  mainToggle={mainToggle}
                />
              )}
              {createStreamsInstance && <Modal mainToggle={mainToggle} />}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export { OpenshiftStreams };
