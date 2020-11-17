import * as React from 'react';
import {
  Button,
  Title
} from '@patternfly/react-core';
import { KafkaInstance } from '../../models/models';

type ModalProps = {

}

const Modal = ({}: ModalProps) => {

  const onCreateInstance = () => {
    // POST REQUEST WILL GO HERE
  }

  return (
    <>
    <Title headingLevel="h1" size="lg">Modal goes here</Title>
    <Button variant="primary" onClick={() => onCreateInstance()}>Create instance</Button>
    </>
  );
}

export { Modal };
