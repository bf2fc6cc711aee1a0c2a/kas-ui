import * as React from 'react';
import {
  Button,
  Title
} from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import axios from 'axios';
import { Services } from '../../common/app-config';
import { NewKafka } from '../../models/models';

type ModalProps = {
  mainToggle: boolean
}


// const fetchKafkas = async () => {
//   await apisService.listKafkas()


const Modal = ({mainToggle}: ModalProps) => {

  const apisService = Services.getInstance().apiService;

  const onCreateInstance = async (event) => {
    // Check if the event is not empty

    // Update this to use the values from the event
    const newKafka: NewKafka = new NewKafka();
    newKafka.name = "test";
    newKafka.multi_az = false;
    newKafka.owner = "test";
    newKafka.region = "test";
    newKafka.cloud_provider = "test";

    await apisService.createKafka(true, newKafka).then(res => {
      console.info("Kafka was successfully created")
      // TO DO: User needs to know what Kafka was successfully created
    })
    .catch(error => {
      console.error("Error creating Kafka")
      // TO DO: Set up error handling
    })
  }

  return (
    <>
    <Title headingLevel="h1" size="lg">Modal goes here</Title>
    <Button variant="primary" onClick={onCreateInstance}>Create instance</Button>
    </>
  );
}

export { Modal };
