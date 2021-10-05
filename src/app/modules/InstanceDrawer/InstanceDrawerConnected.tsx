import React, { useEffect } from "react";
import { InstanceDrawer, InstanceDrawerProps } from "./InstanceDrawer";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";
import { ModalProvider } from "@rhoas/app-services-ui-components";
import { KasModalLoader } from "@app/modals";

export type InstanceDrawerConnectedProps = InstanceDrawerProps & {
  isOpenDeleteInstanceModal: boolean;
  setIsOpenDeleteInstanceModal: (isopen: boolean) => void;
  onDeleteInstance: () => void;
};

const InstanceDrawerConnected: React.FC<InstanceDrawerConnectedProps> = ({
  isExpanded,
  initialTab,
  onClose,
  "data-ouia-app-id": dataOuiaAppId,
  tokenEndPointUrl,
  children,
  instanceDetail = {},
  isLoading,
  isOpenDeleteInstanceModal,
  setIsOpenDeleteInstanceModal,
  onDeleteInstance,
}) => {
  const { showModal } = useModal<ModalType.KasDeleteInstance>();

  const showDeleteInstanceModal = () => {
    showModal(ModalType.KasDeleteInstance, {
      kafka: instanceDetail,
      // onDelete: onDeleteInstance,
      // setIsOpenDeleteInstanceModal,
    });
  };

  useEffect(() => {
    if (isOpenDeleteInstanceModal) {
      showDeleteInstanceModal();
    }
  }, [isOpenDeleteInstanceModal]);

  return (
    <ModalProvider>
      <InstanceDrawer
        isExpanded={isExpanded}
        initialTab={initialTab}
        onClose={onClose}
        data-ouia-app-id={dataOuiaAppId}
        tokenEndPointUrl={tokenEndPointUrl}
        isLoading={isLoading}
        instanceDetail={instanceDetail}
      >
        {children}
      </InstanceDrawer>
      <KasModalLoader/>
    </ModalProvider>
  );
};

export { InstanceDrawerConnected };
