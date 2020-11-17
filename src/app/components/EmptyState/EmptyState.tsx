import * as React from 'react';
import { 
  Title,
  Button
} from '@patternfly/react-core';

type EmptyStateProps = {
  createStreamsInstance: boolean,
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
};

const EmptyState = ({createStreamsInstance, setCreateStreamsInstance}: EmptyStateProps) => {

  return (
    <>
      <Title headingLevel="h1" size="lg">Empty state goes here</Title>
      <Button variant="primary" onClick={() => setCreateStreamsInstance(createStreamsInstance)}>
        Create a Streams Instance
      </Button>
    </>
  )
}

export { EmptyState };
