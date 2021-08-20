import React from 'react';
import { KasTableView } from './KasTableView';
import { RootModal } from '@app/common/RootModal';

export const KasTableConnected: React.FunctionComponent = () => {
  return (
    <RootModal>
      <KasTableView tokenEndPointUrl='fake-token-url' />
    </RootModal>
  );
};
