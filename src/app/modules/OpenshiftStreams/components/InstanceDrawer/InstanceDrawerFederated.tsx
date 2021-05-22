import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { InstanceDrawerConnected } from './InstanceDrawerConnected';
import { RootModal } from '@app/common';
import kasi18n from '../../../../../i18n/i18n';

const InstanceDrawerFederated = ({
  isExpanded,
  activeTab,
  onClose,
  'data-ouia-app-id': dataOuiaAppId,
  getConnectToRoutePath,
  onConnectToRoute,
  tokenEndPointUrl,
  children,
  mainToggle,
  instanceDetail,
  setIsOpenDeleteInstanceModal,
  isOpenDeleteInstanceModal,
}) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={kasi18n}>
        <RootModal>
          <InstanceDrawerConnected
            isExpanded={isExpanded}
            activeTab={activeTab}
            onClose={onClose}
            data-ouia-app-id={dataOuiaAppId}
            getConnectToRoutePath={getConnectToRoutePath}
            onConnectToRoute={onConnectToRoute}
            tokenEndPointUrl={tokenEndPointUrl}
            mainToggle={mainToggle}
            isLoading={instanceDetail === undefined}
            instanceDetail={instanceDetail}
            setIsOpenDeleteInstanceModal={setIsOpenDeleteInstanceModal}
            isOpenDeleteInstanceModal={isOpenDeleteInstanceModal}
          >
            {children}
          </InstanceDrawerConnected>
        </RootModal>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default InstanceDrawerFederated;
