import React from 'react';
import { Bullseye, BullseyeProps, Spinner, SpinnerProps } from '@patternfly/react-core';

export type LoadingProps = {
  bullseyeProps?: Omit<BullseyeProps, 'children'>;
  spinnerProps?: SpinnerProps;
};

export const Loading: React.FunctionComponent<LoadingProps> = ({ bullseyeProps, spinnerProps }: LoadingProps) => (
  <Bullseye {...bullseyeProps}>
    <Spinner {...spinnerProps} />
  </Bullseye>
);
