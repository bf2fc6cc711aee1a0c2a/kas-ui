import React, {useState, useContext, useEffect} from 'react';
import {
  Switch,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title
} from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { StreamsTableView } from '../components/StreamsTableView/StreamsTableView';
import { Modal } from '../components/Modal/Modal';
import { KafkaRequestList, KafkaRequestAllOf } from '../../openapi/api';
import { Services } from '../common/app-config';


const OpenshiftStreams = () => {

  // Api Service
  const apisService = Services.getInstance().apiService;

  // States
  const [ createStreamsInstance,  setCreateStreamsInstance ] = useState(false);
  const [ kafkaInstancesList, setKafkaInstancesList ] = useState<KafkaRequestList>({});
  const [ kafkaInstanceItems, setKafkaInstanceItems ] =  useState<KafkaRequestAllOf[]>([]); // Change this to 0 if you are working on the empty state
  const [ mainToggle, setMainToggle ] = useState(false);

  useEffect(() => {
    fetchKafkas();
  }, []);

  // Functions
  const fetchKafkas = async () => {
    await apisService.listKafkas()
    .then(res => {
      const kafkaInstances = res.data;
      console.log('what is res' + JSON.stringify(kafkaInstances));
      setKafkaInstancesList(kafkaInstances);
      setKafkaInstanceItems(kafkaInstances.items);
    })
  }

  const handleSwitchChange = () => {
    setMainToggle(!mainToggle);
  }

  return (
    <>
    <PageSection variant={PageSectionVariants.light}>
      <Level>
        <LevelItem>
          <Title headingLevel="h1" size="lg">OpenshiftStreams</Title>
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
      { kafkaInstanceItems.length > 0 ? (
        <StreamsTableView
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
      { createStreamsInstance &&
        <Modal
          mainToggle={mainToggle}
        />
      }
    </PageSection>
  </>
  )
}

export { OpenshiftStreams };
