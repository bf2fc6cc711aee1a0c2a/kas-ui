import React from 'react';
import { ServiceAccounts } from './ServiceAccounts';
import { RootModal } from '@app/common';

export const ServiceAccountsConnected: React.FunctionComponent = () => {
  return (
    <RootModal>
      <ServiceAccounts />
    </RootModal>
  );
};
