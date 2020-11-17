import * as React from 'react';
import { Button, PageSection, Title } from '@patternfly/react-core';

const Modal: React.FunctionComponent = () => {

  const onCreateInstance = () => {
    
  }

  return (
  <PageSection>
    <Title headingLevel="h1" size="lg">Modal goes here</Title>
    <Button variant="primary" onClick={() => onCreateInstance()}>Create instance</Button>
  </PageSection>
  );
}

export { Modal };
