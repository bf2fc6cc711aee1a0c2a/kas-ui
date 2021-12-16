import React from 'react';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from './KasModalLoader';

const KasModalLoaderFederated: React.FC = ({ children }) => {
  return (
    <ModalProvider>
      {children}
      <KasModalLoader />
    </ModalProvider>
  );
};

export default KasModalLoaderFederated;
