import React from 'react';
import { PageSection, Bullseye } from '@patternfly/react-core';
import { Spinner } from '@redhat-cloud-services/frontend-components';
import './Loading.css';

export const Loading: React.FunctionComponent = () => (
  <PageSection>
    <div className="pf-bullseye-comp">
        <Spinner />
    </div>
  </PageSection>
);
