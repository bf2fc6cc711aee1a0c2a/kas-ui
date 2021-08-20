import {
  FieldType,
  FilterOptionType,
  Option,
  ServiceTableConfig,
} from '@app/modules/KasTable/config';
import { useTranslation } from 'react-i18next';
import { InstanceStatus, KeyValueOptions } from '@app/utils';
import { sortable } from '@patternfly/react-table';

export const useKasTableConfig = (): ServiceTableConfig => {
  const { t } = useTranslation();

  const cloudProviderOptions: Option[] = [
    { value: 'aws' },
    // Only aws is supported for now
    // { value: 'azure', label: 'Microsoft Azure' },
    // { value: 'baremetal', label: 'Bare Metal' },
    // { value: 'gcp', label: 'Google Cloud Platform' },
    // { value: 'libvirt', label: 'Libvirt' },
    // { value: 'openstack', label: 'OpenStack' },
    // { value: 'vsphere', label: 'VSphere' },
  ].map(({ value }) => {
    return {
      value,
      label: t(value),
      disabled: false,
    };
  });

  const statusOptions: Option[] = [
    { value: InstanceStatus.READY },
    { value: InstanceStatus.FAILED },
    { value: InstanceStatus.ACCEPTED },
    { value: InstanceStatus.PROVISIONING },
    { value: InstanceStatus.DEPROVISION },
  ].map(({ value }) => {
    return {
      value: value.toString(),
      label: t(value.toString()),
      disabled: false,
    };
  });

  const cloudRegionOptions: KeyValueOptions[] = [
    { value: 'us-east-1' },

    // Only us-east is supported for now
    // { value: 'ap-northeast-1', label: 'Asia Pacific, Tokyo' },
    // { value: 'ap-northeast-2', label: 'Asia Pacific, Seoul' },
    // { value: 'ap-south-1', label: 'Asia Pacific, Mumbai' },
    // { value: 'ap-southeast-1', label: 'Asia Pacific, Singapore' },
    // { value: 'ap-southeast-2', label: 'Asia Pacific, Sydney' },
    // { value: 'ca-central-1', label: 'Canada, Central' },
    // { value: 'eu-central-1', label: 'EU, Frankfurt' },
    // { value: 'eu-north-1', label: 'EU, Stockholm' },
    // { value: 'eu-west-1', label: 'EU, Ireland' },
    // { value: 'eu-west-2', label: 'EU, London' },
    // { value: 'eu-west-3', label: 'EU, Paris' },
    // { value: 'me-south-1', label: 'Middle East, Bahrain' },
    // { value: 'sa-east-1', label: 'South America, São Paulo' },
    // { value: 'us-east-2', label: 'US East, Ohio' },
    // { value: 'us-west-1', label: 'US West, N. California' },
    // { value: 'us-west-2', label: 'US West, Oregon' },
  ].map(({ value }) => {
    return {
      value,
      label: t(value),
      disabled: false,
    };
  });

  return {
    id: 'kas',
    filters: {
      defaultFilter: 'name',
    },
    fields: [
      {
        label: t('name'),
        key: 'name',
        filterDisabled: false,
        filterType: FilterOptionType.TEXT_INPUT,
        columnTransforms: [sortable],
        type: FieldType.NAME,
      },
      {
        label: t('cloud_provider'),
        key: 'cloud_provider',
        filterDisabled: false,
        filterType: FilterOptionType.SELECT,
        filterOptions: cloudProviderOptions,
        columnTransforms: [sortable],
      },
      {
        label: t('region'),
        key: 'region',
        filterDisabled: false,
        filterType: FilterOptionType.SELECT,
        filterOptions: cloudRegionOptions,
        columnTransforms: [sortable],
      },
      {
        label: t('owner'),
        key: 'owner',
        filterDisabled: false,
        filterType: FilterOptionType.TEXT_INPUT,
        columnTransforms: [sortable],
      },
      {
        label: t('status'),
        key: 'status',
        filterDisabled: false,
        filterType: FilterOptionType.SELECT,
        filterOptions: statusOptions,
        columnTransforms: [sortable],
        type: FieldType.STATUS,
      },
      {
        label: t('time_created'),
        key: 'created_at',
        columnTransforms: [sortable],
        type: FieldType.DATE,
        filterDisabled: false,
        filterType: FilterOptionType.TEXT_INPUT,
      },
    ],
  };
};
