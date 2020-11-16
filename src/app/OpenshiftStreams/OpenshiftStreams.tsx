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

const OpenshiftStreams: React.FunctionComponent = () => {

  const globalContext: GlobalContextObj = useContext(GlobalContext);

  const { mainToggle } = {... useContext(GlobalContext).store};
  const [ createStreamsInstanceTrue,  setCreateStreamsInstanceTrue ] = useState(false);

  const [ kafkaInstances, setKafkaInstances ] =  useState([]); // Change this to 0 if you are working on the empty state

  const handleSwitchChange = (isSwitchChecked: boolean) => {
    globalContext.setMainToggle(!isSwitchChecked);
  }

  useEffect(() => {
    axios.get(`http://localhost:8000/api/managed-services-api/v1/kafkas/`)
    .then(res => {
      const kafkas = res.data;
      setKafkaInstances(kafkas.items);
      console.log('what is the kafka' + JSON.stringify(kafkas));
      console.log('what are the items' + JSON.stringify(kafkas.items.length));
    })
  }, []);


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
      { kafkaInstances.length > 0 ? (
        <Table kafkaInstances={kafkaInstances} />
      ) : (
        <EmptyState
          setCreateStreamsInstanceTrue={setCreateStreamsInstanceTrue}
        />
      )}
      { createStreamsInstanceTrue &&
        <Modal/>
      }
    </PageSection>
  </>
  )
}

export { OpenshiftStreams };
