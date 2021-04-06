import React, { useState, createContext, useContext } from 'react';
import { CreateInstanceModal, DeleteInstanceModal } from '@app/modules/OpenshiftStreams/components';
import {
  CreateServiceAccountModal,
  DeleteServiceAccountModal,
  ResetServiceAccountModal,
} from '@app/modules/ServiceAccounts/components';
import { MASGenerateCredentialsModal } from '@app/common';

export const MODAL_TYPES = {
  CREATE_KAFKA_INSTANCE: 'CREATE_KAFKA_INSTANCE',
  DELETE_KAFKA_INSTANCE: 'DELETE_KAFKA_INSTANCE',
  CREATE_SERVICE_ACCOUNT: 'CREATE_SERVICE_ACCOUNT',
  DELETE_SERVICE_ACCOUNT: 'DELETE_SERVICE_ACCOUNT',
  RESET_CREDENTIALS: 'RESET_CREDENTIALS',
  GENERATE_CREDENTIALS: 'GENERATE_CREDENTIALS',
};

const MODAL_COMPONENTS: any = {
  [MODAL_TYPES.CREATE_KAFKA_INSTANCE]: CreateInstanceModal,
  [MODAL_TYPES.DELETE_KAFKA_INSTANCE]: DeleteInstanceModal,
  [MODAL_TYPES.CREATE_SERVICE_ACCOUNT]: CreateServiceAccountModal,
  [MODAL_TYPES.DELETE_SERVICE_ACCOUNT]: DeleteServiceAccountModal,
  [MODAL_TYPES.RESET_CREDENTIALS]: ResetServiceAccountModal,
  [MODAL_TYPES.GENERATE_CREDENTIALS]: MASGenerateCredentialsModal,
};

type GlobalModalContext = {
  showModal: (modalType: string, modalProps?: any) => void;
  hideModal: () => void;
  store: any;
};

const initalState: GlobalModalContext = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};

const GlobalModalContext = createContext(initalState);
export const useGlobalModalContext = () => useContext(GlobalModalContext);

export const GlobalModal: React.FC<{}> = ({ children }) => {
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
    <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </GlobalModalContext.Provider>
  );
};
