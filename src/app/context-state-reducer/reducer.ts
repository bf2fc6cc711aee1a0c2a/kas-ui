/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import { types } from './actions';
import { initialState, initialStateModal } from './initialState';
import { combineReducers } from './combineReducers';

export interface IActionType {
  type: string;
  payload?: any;
}

export interface IModalActionType {
  type: string;
  modalType: string;
  modalProps: any;
}

const kafkaListReducer = (state = initialState, action: IActionType) => {
  switch (action.type) {
    case types.UPDATE_KAFKA_INSTANCE_ITEMS:
      return {
        ...state,
        kafkaInstanceItems: action.payload,
      };
    case types.UPDATE_KAFKA_INSTANCE_LIST:
      return {
        ...state,
        kafkaInstancesList: action.payload,
      };
    case types.UPDATE_CLOUD_PROVIDERS:
      return {
        ...state,
        cloudProviders: action.payload,
      };
    case types.UPDATE_KAFKA_DATA_LOADED:
      return {
        ...state,
        kafkaDataLoaded: action.payload,
      };
    case types.UPDATE_SELECTED_INSTANCE:
      return {
        ...state,
        selectedInstance: action.payload,
      };
    case types.UPDATE_EXPECTED_TOTAL:
      return {
        ...state,
        expectedTotal: action.payload,
      };
    case types.UPDATE_FILTER_SELECTED:
      return {
        ...state,
        filterSelected: action.payload,
      };
    case types.UPDATE_FILTER_VALUES:
      return {
        ...state,
        filteredValue: action.payload,
      };
    case types.UPDATE_ORDER_BY:
      return {
        ...state,
        orderBy: action.payload,
      };
    default:
      return state;
  }
};

const modalReducer = (state = initialStateModal, action: IModalActionType) => {
  switch (action.type) {
    case types.SHOW_MODAL:
      return {
        modalType: action.modalType,
        modalProps: action.modalProps,
      };
    case types.HIDE_MODAL:
      return initialStateModal;
    default:
      return state;
  }
};

export const rootReducer = combineReducers({
  openshift_state: kafkaListReducer,
  modal: modalReducer,
});
