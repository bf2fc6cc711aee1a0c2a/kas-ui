import React from 'react';
import { Bullseye, BullseyeProps } from '@patternfly/react-core';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';

export type MASLoadingProps = {
  bullseyeProps?: Omit<BullseyeProps, 'children'>;
  spinnerProps?: {
    centered?: boolean;
    className?: string;
  };
};

export const MASLoading: React.FunctionComponent<MASLoadingProps> = ({
  bullseyeProps,
  spinnerProps,
}: MASLoadingProps) => (
  <Bullseye {...bullseyeProps}>
    <Spinner {...spinnerProps} />
  </Bullseye>
);
