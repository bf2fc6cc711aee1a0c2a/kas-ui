import React, { useContext, useEffect, useState } from 'react';
import { Level, LevelItem, PageSection, PageSectionVariants, Switch, Title } from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { CreateInstanceModal } from '../components/CreateInstanceModal/CreateInstanceModal';
import { DefaultApi, KafkaRequestAllOf, KafkaRequestList } from '../../openapi/api';
import { AlertProvider } from '../components/Alerts/Alerts';
import { AuthContext } from '@app/auth/AuthContext';
import { InstanceListToolbar } from '../components/StreamsTableView/InstanceListToolbar';

const OpenshiftStreams = () => {
  const { token } = useContext(AuthContext);

  // Api Service
  const apisService = new DefaultApi({
    accessToken: token,
  });

  // States
  const [createStreamsInstance, setCreateStreamsInstance] = useState(false);
  const [kafkaInstancesList, setKafkaInstancesList] = useState<KafkaRequestList>({} as KafkaRequestList);
  const [kafkaInstanceItems, setKafkaInstanceItems] = useState<KafkaRequestAllOf[]>([]); // Change this to 0 if you are working on the empty state
  const [mainToggle, setMainToggle] = useState(false);

  useEffect(() => {
    fetchKafkas();
  }, []);

  // Functions
  const fetchKafkas = async () => {
    try {
      await apisService.listKafkas().then((res) => {
        const kafkaInstances = res.data;
        console.log('what is res' + JSON.stringify(kafkaInstances));
        setKafkaInstancesList(kafkaInstances);
        setKafkaInstanceItems(kafkaInstances.items);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitchChange = () => {
    setMainToggle(!mainToggle);
  };

  return (
    <>
      <AlertProvider>
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
      <PageSection>
        {kafkaInstanceItems.length > 0 ? (
            <StreamsTableView
              mainToggle={mainToggle}
              kafkaInstanceItems={kafkaInstanceItems}
              createStreamsInstance={createStreamsInstance}
              setCreateStreamsInstance={setCreateStreamsInstance}
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
      </AlertProvider>
    </>
  );
};

export { OpenshiftStreams };
