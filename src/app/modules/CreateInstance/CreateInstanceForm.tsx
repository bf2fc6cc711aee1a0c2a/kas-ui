import {
  createEmptyNewKafkaRequestPayload,
  isKafkaRequestInvalid,
  NewKafkaRequestPayload,
} from '@app/models';
import { CloudProvider, CloudRegion } from '@rhoas/kafka-management-sdk';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_INSTANCE_NAME_LENGTH } from '@app/utils';
import AwsIcon from '@patternfly/react-icons/dist/js/icons/aws-icon';
import {
  Alert,
  Form,
  FormAlert,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
  Tile,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';

export type CreateInstanceFormProps = {
  createInstance: () => Promise<void>;
  kafkaRequest: NewKafkaRequestPayload;
  setKafkaRequest: React.Dispatch<React.SetStateAction<NewKafkaRequestPayload>>;
  cloudProviders: CloudProvider[];
  getCloudRegions: (id: string) => Promise<CloudRegion[] | undefined>;
  id: string;
};

export const CreateInstanceForm: React.FunctionComponent<CreateInstanceFormProps> =
  ({
    createInstance,
    kafkaRequest,
    setKafkaRequest,
    cloudProviders,
    getCloudRegions,
    id,
  }) => {
    const { t } = useTranslation();

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
        createInstance().then(() => resetForm());
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
      if (cloudProviders?.length > 0 && cloudProviders[0].name) {
        selectCloudProvider(cloudProviders[0]);
      }
    }, [cloudProviders]);

    useEffect(() => {
      selectAz(true);
    }, []);

    useEffect(() => {
      const loadCloudRegions = async (cloudProvider: string) => {
        const cloudRegions = await getCloudRegions(cloudProvider);
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

    const getTileIcon = (provider?: string) => {
      switch (provider?.toLowerCase()) {
        case 'aws':
          return (
            <AwsIcon
              size='lg'
              color='black'
              className='mk--create-instance__tile--icon'
            />
          );
        default:
          return;
      }
    };

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
          {cloudProviders?.map((provider: CloudProvider) => {
            return (
              <Tile
                key={`tile-${provider.name}`}
                title={provider.display_name || ''}
                icon={getTileIcon(provider.name)}
                isSelected={kafkaRequest.cloud_provider.value === provider.name}
                onClick={() => selectCloudProvider(provider)}
              />
            );
          })}
        </FormGroup>
        <FormGroup
          label={t('cloud_region')}
          helperTextInvalid={kafkaRequest.region.errorMessage}
          validated={kafkaRequest.region.validated}
          fieldId='form-cloud-region-option'
          isRequired
        >
          <FormSelect
            validated={kafkaRequest.region.validated}
            value={kafkaRequest.region.value}
            onChange={selectCloudRegion}
            id='cloud-region-select'
            name='cloud-region'
            aria-label={t('cloud_region')}
            isDisabled={cloudRegions === undefined}
          >
            {[
              <FormSelectOption
                value=''
                key='placeholder'
                label={t('please_select')}
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
        </FormGroup>
        <FormGroup label={t('availabilty_zones')} fieldId='availability-zones'>
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
