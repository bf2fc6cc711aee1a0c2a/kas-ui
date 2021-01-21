import React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
// import { Spinner } from '@redhat-cloud-services/frontend-components';
// import './Loading.css';

export const Loading: React.FunctionComponent = () => (
  <Bullseye>
    <Spinner />
  </Bullseye>
);
