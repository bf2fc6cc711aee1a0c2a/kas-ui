import React, { useState, createContext, useContext } from 'react';
import { CreateInstance, DeleteInstance, DeleteInstanceConnected } from '@app/modules/OpenshiftStreams/dialogs';
import { CreateServiceAccount, DeleteServiceAccount, ResetServiceAccount } from '@app/modules/ServiceAccounts/dialogs';
import { MASGenerateCredentialsModal } from '@app/common';

export const MODAL_TYPES = {
  CREATE_KAFKA_INSTANCE: 'CREATE_KAFKA_INSTANCE',
  DELETE_KAFKA_INSTANCE: 'DELETE_KAFKA_INSTANCE',
  CREATE_SERVICE_ACCOUNT: 'CREATE_SERVICE_ACCOUNT',
  DELETE_SERVICE_ACCOUNT: 'DELETE_SERVICE_ACCOUNT',
  RESET_CREDENTIALS: 'RESET_CREDENTIALS',
  GENERATE_CREDENTIALS: 'GENERATE_CREDENTIALS',
  DELETE_KAFKA_EXTERNALLY: 'DELETE_KAFKA_EXTERNALLY',
};

const MODAL_COMPONENTS: any = {
  [MODAL_TYPES.CREATE_KAFKA_INSTANCE]: CreateInstance,
  [MODAL_TYPES.DELETE_KAFKA_INSTANCE]: DeleteInstance,
  [MODAL_TYPES.CREATE_SERVICE_ACCOUNT]: CreateServiceAccount,
  [MODAL_TYPES.DELETE_SERVICE_ACCOUNT]: DeleteServiceAccount,
  [MODAL_TYPES.RESET_CREDENTIALS]: ResetServiceAccount,
  [MODAL_TYPES.GENERATE_CREDENTIALS]: MASGenerateCredentialsModal,
  [MODAL_TYPES.DELETE_KAFKA_EXTERNALLY]: DeleteInstanceConnected,
};

type RootModalContext = {
  showModal: (modalType: string, modalProps?: any) => void;
  hideModal: () => void;
  store: any;
};

const initalState: RootModalContext = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};

const RootModalContext = createContext(initalState);
export const useRootModalContext = (): RootModalContext => useContext(RootModalContext);

export const RootModal = ({ children }) => {
  const [store, setStore] = useState();
  const { modalType, modalProps } = store || {};

  const showModal = (modalType: string, modalProps: any = {}) => {
    setStore({
      ...store,
      modalType,
      modalProps,
    });
  };

  const hideModal = () => {
    setStore({
      ...store,
      modalType: null,
      modalProps: {},
    });
  };

  const renderComponent = () => {
    const ModalComponent = MODAL_COMPONENTS[modalType];
    if (!modalType || !ModalComponent) {
      return null;
    }
    return <ModalComponent id="global-modal" {...modalProps} />;
  };

  return (
    <RootModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </RootModalContext.Provider>
  );
};
