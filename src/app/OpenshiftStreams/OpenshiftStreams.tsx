import React, {useState} from 'react';
import { PageSection,PageSectionVariants, Title } from '@patternfly/react-core';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Table } from '../components/Table/Table';
import { Wizard } from '../components/Wizard/Wizard';

const OpenshiftStreams: React.FunctionComponent = () => {

  const [ streamsExist, setStreamsExist ] = useState(false);
  const [ createTrialInstanceTrue,  setCreateTrialInstanceTrue ] = useState(false);
  const [ createStreamsInstanceTrue,  setCreateStreamsInstanceTrue ] = useState(false);

  return (
    <>
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h1" size="lg">OpenshiftStreams</Title>
    </PageSection>
    <PageSection>
      { !streamsExist &&
        <EmptyState
          setCreateTrialInstanceTrue={setCreateTrialInstanceTrue}
          setCreateStreamsInstanceTrue={setCreateStreamsInstanceTrue}
        />
      }
      { createTrialInstanceTrue &&
        <Table/>
      }
      { createStreamsInstanceTrue &&
        <Wizard/>
      }
    </PageSection>
  </>
  )
}

export { OpenshiftStreams };
