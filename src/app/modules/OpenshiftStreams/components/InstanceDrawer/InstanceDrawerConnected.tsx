import React, { useEffect } from 'react';
import { InstanceDrawer, InstanceDrawerProps } from './InstanceDrawer';
import { useRootModalContext, MODAL_TYPES } from '@app/common';

export type InstanceDrawerConnectedProps = InstanceDrawerProps & {
  isOpenDeleteInstanceModal: boolean;
  setIsOpenDeleteInstanceModal: (isopen: boolean) => void;
};

const InstanceDrawerConnected: React.FC<InstanceDrawerConnectedProps> = ({
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
  isLoading,
  isOpenDeleteInstanceModal,
  setIsOpenDeleteInstanceModal,
}) => {
  const { showModal } = useRootModalContext();

  const showDeleteInstanceModal = () => {
    showModal(MODAL_TYPES.DELETE_KAFKA_FROM_DATA_PLANE, {
      selectedItemData: instanceDetail,
      setIsOpenDeleteInstanceModal,
      onConnectToRoute,
    });
  };

  useEffect(() => {
    if (isOpenDeleteInstanceModal) {
      showDeleteInstanceModal();
    }
  }, [isOpenDeleteInstanceModal]);

  return (
    <InstanceDrawer
      isExpanded={isExpanded}
      activeTab={activeTab}
      onClose={onClose}
      data-ouia-app-id={dataOuiaAppId}
      getConnectToRoutePath={getConnectToRoutePath}
      onConnectToRoute={onConnectToRoute}
      tokenEndPointUrl={tokenEndPointUrl}
      mainToggle={mainToggle}
      isLoading={isLoading}
      instanceDetail={instanceDetail}
    >
      {children}
    </InstanceDrawer>
  );
};

export { InstanceDrawerConnected };
