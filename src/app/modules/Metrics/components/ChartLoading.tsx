import { CardBody, Bullseye, Spinner } from '@patternfly/react-core';
import React, { FunctionComponent } from 'react';

export const ChartLoading: FunctionComponent = () => (
  <CardBody>
    <Bullseye>
      <Spinner isSVG />
    </Bullseye>
  </CardBody>
);
