import React, { useEffect } from 'react';
import { InstanceDrawer, InstanceDrawerProps } from './InstanceDrawer';
import { useInstanceDrawer } from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';
import { ModalType, useModal } from '@rhoas/app-services-ui-shared';

export type InstanceDrawerConnectedProps = InstanceDrawerProps & {
  isOpenDeleteInstanceModal: boolean;
  setIsOpenDeleteInstanceModal: (isopen: boolean) => void;
  onDeleteInstance: () => void;
};

const InstanceDrawerConnected: React.FC<InstanceDrawerConnectedProps> = ({
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
  children,
  isOpenDeleteInstanceModal,
  setIsOpenDeleteInstanceModal,
  onDeleteInstance,
}) => {
  const { showModal } = useModal();
  const { instanceDrawerInstance } = useInstanceDrawer();

  const showDeleteInstanceModal = () => {
    if (instanceDrawerInstance === undefined) {
      throw new Error('instanceDrawerInstance is not set');
    }
    showModal(ModalType.KasDeleteInstance, {
      kafka: instanceDrawerInstance,
      onDelete: onDeleteInstance,
    });
  };

  useEffect(() => {
    if (isOpenDeleteInstanceModal) {
      showDeleteInstanceModal();
    }
  }, [isOpenDeleteInstanceModal]);

  return (
    <InstanceDrawer
      data-ouia-app-id={dataOuiaAppId}
      tokenEndPointUrl={tokenEndPointUrl}
    >
      {children}
    </InstanceDrawer>
  );
};

export { InstanceDrawerConnected };
