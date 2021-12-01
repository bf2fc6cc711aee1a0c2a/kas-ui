import { NewKafkaRequestPayload } from '@app/models';
import { CloudRegion } from '@rhoas/kafka-management-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormSelect, FormSelectOption, Skeleton } from '@patternfly/react-core';

export type CloudRegionProps = {
  kafkaRequest: NewKafkaRequestPayload;
  selectCloudRegion: (region: string) => void;
  cloudRegions: CloudRegion[] | undefined;
  quotaLoading?: boolean;
};

export const CloudRegionSelect: React.FunctionComponent<CloudRegionProps> = ({
  kafkaRequest,
  selectCloudRegion,
  cloudRegions,
  quotaLoading,
}) => {
  const { t } = useTranslation();

  return (
    <FormSelect
      validated={kafkaRequest.region.validated}
      value={kafkaRequest.region.value}
      onChange={selectCloudRegion}
      id='cloud-region-select'
      name='cloud-region'
      aria-label={t('select_region')}
      isDisabled={cloudRegions === undefined || quotaLoading}
    >
      {[
        <FormSelectOption
          value=''
          key='placeholder'
          label={t('select_region')}
        />,
        (cloudRegions || []).map(
          ({ id, display_name = '' }: CloudRegion, index) => {
            return (
              <FormSelectOption
                key={index}
                value={id}
                label={id ? t(id) : display_name}
              />
            );
          }
        ),
      ]}
    </FormSelect>
  );
};
