import { ITransform } from '@patternfly/react-table';

export type ServiceTableConfig = {
  id: string;
  filters: {
    defaultFilter: string;
  };
  fields: Field[];
};

export type Field = {
  label: string;
  key: string;
  filterDisabled: boolean;
  filterType: FilterOptionType;
  filterOptions?: Array<Option>;
  columnTransforms: ITransform[];
  type?: FieldType;
};

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export enum FilterOptionType {
  TEXT_INPUT = 'TextInput',
  SELECT = 'Select',
}

export enum FieldType {
  NAME = 'Name',
  DATE = 'Date',
  STATUS = 'Status',
}

export enum InstanceStatus {
  READY = 'ready',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  PROVISIONING = 'provisioning',
  FAILED = 'failed',
  DEPROVISION = 'deprovision',
  DELETED = 'deleting',
}
