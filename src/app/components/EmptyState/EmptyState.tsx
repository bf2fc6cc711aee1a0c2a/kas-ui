import * as React from 'react';
import { PageSection, Title, Button } from '@patternfly/react-core';

const EmptyState: React.FunctionComponent = ({setCreateTrialInstanceTrue, setCreateStreamsInstanceTrue}) => {

  return (
    <>
      <Title headingLevel="h1" size="lg">Empty state goes here</Title>
      <Button variant="primary" onClick={() => setCreateTrialInstanceTrue(true)}>
        Create a Trial Instance
      </Button>
      <Button variant="primary" onClick={() => setCreateStreamsInstanceTrue(true)}>
        Create a Streams Instance
      </Button>
    </>
  )
}

export { EmptyState };
