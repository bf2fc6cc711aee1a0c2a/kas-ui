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
import { string } from 'prop-types';
import { KafkaRequestList, KafkaRequestAllOf } from '../../openapi/api';

const OpenshiftStreams = () => {

  // States
  const [ createStreamsInstance,  setCreateStreamsInstance ] = useState(false);
  const [ kafkaInstancesList, setKafkaInstancesList ] = useState<KafkaRequestList>({});
  const [ kafkaInstanceItems, setKafkaInstanceItems ] =  useState<KafkaRequestAllOf[]>([]); // Change this to 0 if you are working on the empty state
  const [ mainToggle, setMainToggle ] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/managed-services-api/v1/kafkas/`)
    .then(res => {
      const kafkaInstances = res.data;
      setKafkaInstancesList(kafkaInstances)
      setKafkaInstanceItems(kafkaInstances.items);
    })
  }, []);

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
        <Table
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
