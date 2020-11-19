import * as React from 'react';
import {
  Button,
  Title
} from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import axios from 'axios';

type ModalProps = {
  mainToggle: boolean
}

const Modal = ({mainToggle}: ModalProps) => {

  const onCreateInstance = () => {
    // POST REQUEST WILL GO HERE
    axios({
      method: 'post',
      url: '/login',
      data: {
        status: '',
        cloud_provider: '',
        multi_az: '',
        region: '',
        owner: '',
        name: '',
        bootstrapServerHost: '',
        created_at: '',
        updated_at: ''
      }
    });
  }

  return (
    <>
    <Title headingLevel="h1" size="lg">Modal goes here</Title>
    <Button variant="primary" onClick={() => onCreateInstance()}>Create instance</Button>
    </>
  );
}

export { Modal };
