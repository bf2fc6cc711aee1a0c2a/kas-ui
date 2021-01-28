/**
 * kafka-modals
 */
const CREATE_KAFKA = 'CREATE_KAFKA';
const DELETE_KAFKA = 'DELETE_KAFKA';
const GENERATE_CREDENTIAL = 'GENERATE_CREDENTIAL';

/**
 * list kafkas
 */
const UPDATE_KAFKA_LIST = 'UPDATE_KAFKA_LIST';
const GET_KAFKA_LIST = 'GET_KAFKA_LIST';

const UPDATE_KAFKA_INSTANCE_ITEMS = 'UPDATE_KAFKA_INSTANCE_ITEMS';
const UPDATE_KAFKA_INSTANCE_LIST = 'UPDATE_KAFKA_INSTANCE_LIST';
const UPDATE_CLOUD_PROVIDERS = 'UPDATE_CLOUD_PROVIDERS';
const UPDATE_KAFKA_DATA_LOADED = 'UPDATE_KAFKA_DATA_LOADED';
const UPDATE_SELECTED_INSTANCE = 'UPDATE_SELECTED_INSTANCE';
const UPDATE_EXPECTED_TOTAL = 'UPDATE_EXPECTED_TOTAL';
const UPDATE_FILTER_SELECTED = 'UPDATE_FILTER_SELECTED';
const UPDATE_FILTER_VALUES = 'UPDATE_FILTER_VALUES';
const UPDATE_ORDER_BY = 'UPDATE_ORDER_BY'

const SHOW_MODAL = 'SHOW_MODAL';
const HIDE_MODAL = 'HIDE_MODAL';

const types = {
  UPDATE_KAFKA_LIST,
  GET_KAFKA_LIST,
  UPDATE_KAFKA_INSTANCE_ITEMS,
  UPDATE_KAFKA_INSTANCE_LIST,
  UPDATE_CLOUD_PROVIDERS,
  UPDATE_KAFKA_DATA_LOADED,
  UPDATE_SELECTED_INSTANCE,
  UPDATE_EXPECTED_TOTAL,
  UPDATE_FILTER_SELECTED,
  UPDATE_FILTER_VALUES,
  UPDATE_ORDER_BY,
  SHOW_MODAL,
  HIDE_MODAL,
};

const MODAL_TYPES = {
  CREATE_KAFKA,
  DELETE_KAFKA,
  GENERATE_CREDENTIAL,
};

export { MODAL_TYPES, types };
