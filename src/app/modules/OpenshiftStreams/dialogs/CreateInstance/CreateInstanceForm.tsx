import {
  createEmptyNewKafkaRequestPayload,
  isKafkaRequestInvalid,
  NewKafkaRequestPayload,
} from '@app/models';
import { CloudProvider, CloudRegion } from '@rhoas/kafka-management-sdk';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_INSTANCE_NAME_LENGTH } from '@app/utils';
import {
  Alert,
  Form,
  FormAlert,
  FormGroup,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import { CloudRegionSelect } from '@app/modules/OpenshiftStreams/dialogs/CreateInstance/CloudRegionsSelect';
import {
  CloudProvidersTileProps,
  CloudProvidersTiles,
} from '@app/modules/OpenshiftStreams/dialogs/CreateInstance/CloudProviderTiles';

export type CreateInstanceFormProps = Pick<
  CloudProvidersTileProps,
  'cloudProviders'
> & {
  createInstance: () => Promise<void>;
  kafkaRequest: NewKafkaRequestPayload;
  setKafkaRequest: React.Dispatch<React.SetStateAction<NewKafkaRequestPayload>>;
  getCloudRegions: (id: string) => Promise<CloudRegion[] | undefined>;
  id: string;
};

export const CreateInstanceForm: React.FunctionComponent<CreateInstanceFormProps> =
  ({
    createInstance,
    kafkaRequest,
    setKafkaRequest,
    cloudProviders,
    getCloudRegions: fetchCloudRegions,
    id,
  }) => {
    const { t } = useTranslation(['kasTemporaryFixMe']);

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [cloudRegions, setCloudRegions] = useState<
      CloudRegion[] | undefined
    >();

    const validateName = (kafkaRequest: NewKafkaRequestPayload) => {
      //validate required field
      if (
        kafkaRequest.name.value === undefined ||
        kafkaRequest.name.value.trim() === ''
      ) {
        kafkaRequest.name.validated = 'error';
        kafkaRequest.name.errorMessage = t('common.this_is_a_required_field');
      }
      //validate regex
      else if (
        !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(kafkaRequest.name.value.trim())
      ) {
        kafkaRequest.name.validated = 'error';
        kafkaRequest.name.errorMessage = t(
          'common.input_filed_invalid_helper_text'
        );
      }
      //validate max length
      else if (kafkaRequest.name.value.length > MAX_INSTANCE_NAME_LENGTH) {
        kafkaRequest.name.validated = 'error';
        kafkaRequest.name.errorMessage = t('length_is_greater_than_expected', {
          maxLength: MAX_INSTANCE_NAME_LENGTH,
        });
      }
      return kafkaRequest;
    };

    const validateCloudRegion = (kafkaRequest: NewKafkaRequestPayload) => {
      if (
        kafkaRequest.region.value === undefined ||
        kafkaRequest.region.value.trim() === ''
      ) {
        kafkaRequest.region.validated = 'error';
        kafkaRequest.region.errorMessage = t('common.this_is_a_required_field');
      }
      return kafkaRequest;
    };

    const validateMultiAz = (kafkaRequest: NewKafkaRequestPayload) => {
      return kafkaRequest;
    };

    const validateCloudProvider = (kafkaRequest: NewKafkaRequestPayload) => {
      return kafkaRequest;
    };

    const submit = (event) => {
      event.preventDefault();
      setFormSubmitted(true);
      const validated = validateMultiAz(
        validateCloudProvider(validateCloudRegion(validateName(kafkaRequest)))
      );
      setKafkaRequest({ ...validated });

      if (!isKafkaRequestInvalid(validated)) {
        createInstance().then(() => {
          if (kafkaRequest.name.validated !== 'error') {
            resetForm();
          }
        });
      }
    };

    const resetForm = () => {
      setFormSubmitted(false);
      setKafkaRequest(createEmptyNewKafkaRequestPayload());
    };

    const setName = (name: string) => {
      setKafkaRequest((prevState) => {
        const value = {
          ...prevState,
          name: {
            value: name,
          },
        };
        return validateName(value);
      });
    };

    const selectCloudProvider = (cloudProvider: CloudProvider) => {
      setKafkaRequest((prevState) => {
        const kafkaRequest = {
          ...prevState,
          cloud_provider: {
            value: cloudProvider.name || '',
          },
        };
        return validateCloudProvider(kafkaRequest);
      });
    };

    const selectCloudRegion = (region: string) => {
      setKafkaRequest((prevState) => {
        const kafkaRequest = {
          ...prevState,
          region: {
            value: region || '',
          },
        };
        return validateCloudRegion(kafkaRequest);
      });
    };

    const selectAz = (selected: boolean) => {
      setKafkaRequest((prevState) => {
        const kafkaRequest = {
          ...prevState,
          multi_az: {
            value: selected,
          },
        };
        return validateMultiAz(kafkaRequest);
      });
    };

    useEffect(() => {
      if (
        cloudProviders !== undefined &&
        cloudProviders.length > 0 &&
        cloudProviders[0].name
      ) {
        selectCloudProvider(cloudProviders[0]);
      }
    }, [cloudProviders]);

    useEffect(() => {
      selectAz(true);
    }, []);

    useEffect(() => {
      const loadCloudRegions = async (cloudProvider: string) => {
        const cloudRegions = await fetchCloudRegions(cloudProvider);
        //set default selected region if there is one region
        if (
          cloudRegions !== undefined &&
          cloudRegions.length === 1 &&
          cloudRegions[0].id !== undefined
        ) {
          selectCloudRegion(cloudRegions[0].id);
        }
        setCloudRegions(cloudRegions);
      };
      if (kafkaRequest.cloud_provider.value !== undefined) {
        loadCloudRegions(kafkaRequest.cloud_provider.value);
      }
    }, [kafkaRequest.cloud_provider]);

    const FormValidAlert: React.FunctionComponent = () => {
      if (formSubmitted && isKafkaRequestInvalid(kafkaRequest)) {
        return (
          <FormAlert>
            <Alert
              variant='danger'
              title={t('common.form_invalid_alert')}
              aria-live='polite'
              isInline
            />
          </FormAlert>
        );
      }
      return <></>;
    };

    return (
      <Form onSubmit={submit} id={id}>
        <FormValidAlert />
        <FormGroup
          label={t('instance_name')}
          helperText={t('create_instance_name_helper_text')}
          helperTextInvalid={kafkaRequest.name.errorMessage}
          isRequired
          validated={kafkaRequest.name.validated}
          fieldId='form-instance-name'
        >
          <TextInput
            isRequired
            validated={kafkaRequest.name.validated}
            type='text'
            id='form-instance-name'
            name='instance-name'
            value={kafkaRequest.name.value}
            onChange={setName}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup
          label={t('cloud_provider')}
          fieldId='form-cloud-provider-name'
        >
          <CloudProvidersTiles
            kafkaRequest={kafkaRequest}
            selectCloudProvider={selectCloudProvider}
            cloudProviders={cloudProviders}
          />
        </FormGroup>
        <FormGroup
          label={t('cloud_region')}
          helperTextInvalid={kafkaRequest.region.errorMessage}
          validated={kafkaRequest.region.validated}
          fieldId='form-cloud-region-option'
          isRequired
        >
          <CloudRegionSelect
            kafkaRequest={kafkaRequest}
            selectCloudRegion={selectCloudRegion}
            cloudRegions={cloudRegions}
          />
        </FormGroup>
        <FormGroup label={t('availability_zones')} fieldId='availability-zones'>
          <ToggleGroup aria-label={t('availability_zone_selection')}>
            <Tooltip
              content={t('kafkaInstance.availabilty_zones_tooltip_message')}
            >
              <ToggleGroupItem
                text={t('single')}
                value={'single'}
                isDisabled
                buttonId='single'
                onChange={selectAz}
              />
            </Tooltip>
            <ToggleGroupItem
              text={t('multi')}
              value='multi'
              buttonId='multi'
              isSelected={kafkaRequest.multi_az.value || false}
              onChange={selectAz}
            />
            <Tooltip
              content={t('kafkaInstance.availabilty_zones_tooltip_message')}
              reference={() =>
                document.getElementById('multi') ||
                document.createElement('span')
              }
            />
          </ToggleGroup>
        </FormGroup>
      </Form>
    );
  };
