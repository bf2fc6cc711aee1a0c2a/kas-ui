import React from 'react';
import { useStoreContext, MODAL_TYPES } from '@app/context-state-reducer';
import { CreateInstanceModal } from '@app/components/CreateInstanceModal/CreateInstanceModal';
import { DeleteInstanceModal } from '@app/components/DeleteInstanceModal';

const MODAL_COMPONENTS: any = {
  [MODAL_TYPES.CREATE_KAFKA]: CreateInstanceModal,
  [MODAL_TYPES.DELETE_KAFKA]: DeleteInstanceModal
};

const RootModal: React.FC<{}> = () => {
  const { state } = useStoreContext();
  const { modalType, modalProps } = (state && state.modal) || {};
  const ModalComponent = MODAL_COMPONENTS[modalType];
  if (!modalType || !ModalComponent) {
    return null;
  }
  return <ModalComponent id="root-modal-component" {...modalProps} />;
};

export {RootModal}