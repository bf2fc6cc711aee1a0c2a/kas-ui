import React, {useState, useContext, useEffect} from 'react';
import {
  Switch,
  Level,
  LevelItem,
  PageSection,
  PageSectionVariants,
  Title
} from '@patternfly/react-core';
import axios from 'axios';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Table } from '../components/Table/Table';
import { Modal } from '../components/Modal/Modal';
import { GlobalContext, GlobalContextObj } from '../../context/GlobalContext';
import { string } from 'prop-types';
import { KafkaInstanceRequest, KafkaInstance } from '../models/models';

const OpenshiftStreams = () => {

  // Context
  const globalContext: GlobalContextObj = useContext(GlobalContext);
  const { mainToggle } = {... useContext(GlobalContext).store};

  // States
  const [ createStreamsInstance,  setCreateStreamsInstance ] = useState(false);
  const [ kafkaInstancesList, setKafkaInstancesList ] = useState<KafkaInstanceRequest>({});
  const [ kafkaInstanceItems, setKafkaInstanceItems ] =  useState<KafkaInstance[]>([]); // Change this to 0 if you are working on the empty state

  useEffect(() => {
    axios.get(`http://localhost:8000/api/managed-services-api/v1/kafkas/`)
    .then(res => {
      const kafkaInstances = res.data;
      setKafkaInstancesList(kafkaInstances)
      setKafkaInstanceItems(kafkaInstances.items);
    })
  }, []);

  // Functions
  const handleSwitchChange = (isSwitchChecked: boolean) => {
    globalContext.setMainToggle(!isSwitchChecked);
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
            onChange={handleSwitchChange}
          />
        </LevelItem>
      </Level>
    </PageSection>
    <PageSection>
      { kafkaInstanceItems.length > 0 ? (
        <Table kafkaInstanceItems={kafkaInstanceItems} />
      ) : (
        <EmptyState
          createStreamsInstance={createStreamsInstance}
          setCreateStreamsInstance={setCreateStreamsInstance}
        />
      )}
      { createStreamsInstance &&
        <Modal/>
      }
    </PageSection>
  </>
  )
}

export { OpenshiftStreams };
