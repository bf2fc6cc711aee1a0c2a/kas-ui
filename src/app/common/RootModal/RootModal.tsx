import React, { useState, createContext, useContext } from 'react';
import { MASGenerateCredentialsModal, MASLoading } from '@app/common';

const CreateInstance = React.lazy(() => import('@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstance'));
const DeleteInstance = React.lazy(() => import('@app/modules/OpenshiftStreams/dialogs/DeleteInstance/DeleteInstance'));
const DeleteInstanceConnected = React.lazy(() => import('@app/modules/OpenshiftStreams/dialogs/DeleteInstance/DeleteInstanceConnected'));
const CreateServiceAccount = React.lazy(() => import('@app/modules/ServiceAccounts/dialogs/CreateServiceAccount/CreateServiceAccount'));
const DeleteServiceAccount = React.lazy(() => import('@app/modules/ServiceAccounts/dialogs/DeleteServiceAccount/DeleteServiceAccount'));
const ResetServiceAccount = React.lazy(() => import('@app/modules/ServiceAccounts/dialogs/ResetServiceAccount/ResetServiceAccount'));

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

type RootModalStore = {
  modalType: string;
  modalProps: any;
};

export const RootModal = ({ children }) => {
  const [store, setStore] = useState<RootModalStore>();
  const { modalType = '', modalProps } = store || {};

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
      modalType: '',
      modalProps: {},
    });
  };

  const renderComponent = () => {
    const ModalComponent = MODAL_COMPONENTS[modalType];
    if (!modalType.length || !ModalComponent) {
      return null;
    }
    return (
      <React.Suspense fallback={<MASLoading />}>
        <ModalComponent id="global-modal" {...modalProps} />
      </React.Suspense>
    );
  };

  return (
    <RootModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
    </RootModalContext.Provider>
  );
};
