import React from 'react';
import { Bullseye, BullseyeProps, Spinner, SpinnerProps } from '@patternfly/react-core';
//import { Spinner } from '@redhat-cloud-services/frontend-components';
// import './Loading.css';

export type LoadingProps = {
  bullseyeProps?: Omit<BullseyeProps, 'children'>;
  spinnerProps?: SpinnerProps;
};

export const Loading: React.FunctionComponent<LoadingProps> = ({ bullseyeProps, spinnerProps }: LoadingProps) => (
  <Bullseye {...bullseyeProps}>
    <Spinner {...spinnerProps} />
  </Bullseye>
);
