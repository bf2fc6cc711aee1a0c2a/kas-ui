import { KafkaRequest, KafkaRequestList, CloudProvider } from 'src/openapi';
import { FilterType } from '@app/components/StreamsTableView/StreamsTableView';

export interface OpenShiftStreamsState {
  kafkaInstanceItems: KafkaRequest[];
  kafkaInstancesList: KafkaRequestList;
  cloudProviders: CloudProvider[];
  kafkaDataLoaded: boolean;
  selectedInstance: KafkaRequest | null;
  expectedTotal: number;
  filterSelected: string;
  filteredValue: FilterType[];
  orderBy:string;
}

export const initialState: OpenShiftStreamsState = {
  kafkaInstanceItems: [],
  kafkaInstancesList: {} as KafkaRequestList,
  cloudProviders: [],
  kafkaDataLoaded: false,
  selectedInstance: null,
  expectedTotal: 0,
  filterSelected: 'name',
  filteredValue: [],
  orderBy:'created_at desc'
};
export interface IInitialStateModal {
  modal: {
    modalType: string | null;
    modalProps: any;
  };
}

export const initialStateModal: IInitialStateModal = {
  modal: {
    modalType: null,
    modalProps: {},
  },
};
