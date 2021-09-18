import React, { useEffect } from 'react';
import { InstanceDrawer, InstanceDrawerProps } from './InstanceDrawer';
import { useRootModalContext, KAFKA_MODAL_TYPES } from '@app/common';

export type InstanceDrawerConnectedProps = InstanceDrawerProps & {
  isOpenDeleteInstanceModal: boolean;
  setIsOpenDeleteInstanceModal: (isopen: boolean) => void;
  onDeleteInstance: () => void;
};

const InstanceDrawerConnected: React.FC<InstanceDrawerConnectedProps> = ({
  isExpanded,
  activeTab,
  onClose,
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
  children,
  mainToggle,
  instanceDetail,
  isLoading,
  isOpenDeleteInstanceModal,
  setIsOpenDeleteInstanceModal,
  onDeleteInstance,
}) => {
  const { showModal } = useRootModalContext();

  const showDeleteInstanceModal = () => {
    showModal(KAFKA_MODAL_TYPES.DELETE_KAFKA_EXTERNALLY, {
      selectedItemData: instanceDetail,
      setIsOpenDeleteInstanceModal,
      onDeleteInstance,
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
