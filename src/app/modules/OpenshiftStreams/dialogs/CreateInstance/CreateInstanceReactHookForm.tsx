import React from 'react';
import { useTranslation } from 'react-i18next';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Alert,
  AlertVariant,
  Form,
  FormAlert,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
  Tile,
  ToggleGroup,
  ToggleGroupItem,
  Flex,
  FlexItem,
  Divider,
  Tooltip,
} from '@patternfly/react-core';
import AwsIcon from '@patternfly/react-icons/dist/js/icons/aws-icon';
import { isServiceApiError } from '@app/utils/error';
import { MAX_INSTANCE_NAME_LENGTH } from '@app/utils/utils';
import { MASCreateModal, useRootModalContext } from '@app/common';
import { ErrorCodes } from '@app/utils';
import { DefaultApi, CloudProvider, CloudRegion, Configuration } from '@rhoas/kafka-management-sdk';
import { NewKafka, FormDataValidationState } from '../../../../models';
import './CreateInstance.css';
import { DrawerPanelContentInfo } from './DrawerPanelContentInfo';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';

const CreateInstanceReactHookForm: React.FC = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    instanceName: yup
      .string()
      .max(32, t('length_is_greater_than_expected'))
      .matches(/^[a-z]([-a-z0-9]*[a-z0-9])?$/, { message: t('common.input_filed_invalid_helper_text') })
      .required(t('common.this_is_a_required_field')),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
  });

  const onFormSubmit = (data: any) => {
    console.log('onFormSubmit', data);
  };

  const createInstanceForm = () => {
    // const { message, fieldState } = nameValidated;
    // const { name, cloud_provider, multi_az, region } = kafkaFormData;
    // const isMultiSelected = multi_az;
    return (
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        {!isValid && (
          <FormAlert>
            <Alert variant="danger" title={t('common.form_invalid_alert')} aria-live="polite" isInline />
          </FormAlert>
        )}
        <FormGroup
          label={t('instance_name')}
          helperText={t('create_instance_name_helper_text')}
          helperTextInvalid={t('common.input_filed_invalid_helper_text')}
          isRequired
          validated={errors?.instanceName?.message ? 'error' : 'default'}
          fieldId="form-instance-name"
        >
          <TextInput
            isRequired
            validated={errors.instanceName ? 'error' : 'default'}
            type="text"
            id="form-instance-name"
            name="instanceName"
            autoFocus={true}
          />
          {/* <Controller
            name="instanceName"
            control={control}
            defaultValue={''}
            rules={{ required: true }}
            render={({ field }) => (
              <TextInput
                isRequired
                validated={errors.instanceName ? 'error' : 'default'}
                type="text"
                id="form-instance-name"
                name="instanceName"
                autoFocus={true}
                {...field}
              />
            )} 
          />*/}
        </FormGroup>
        {/* <FormGroup label={t('cloud_provider')} fieldId="form-cloud-provider-name">
          {cloudProviders?.map((provider: CloudProvider) => {
            const { name, display_name = '' } = provider;
            return (
              <Tile
                key={`tile-${name}`}
                title={display_name}
                icon={getTileIcon(name)}
                isSelected={cloud_provider === name}
                onClick={() => onCloudProviderSelect(provider)}
              />
            );
          })}
        </FormGroup>
        <FormGroup
          label={t('cloud_region')}
          helperTextInvalid={cloudRegionValidated.message}
          validated={cloudRegionValidated.fieldState}
          fieldId="form-cloud-region-option"
          isRequired
        >
          <FormSelect
            validated={cloudRegionValidated.fieldState}
            value={region}
            onChange={onChangeCloudRegion}
            id="cloud-region-select"
            name="cloud-region"
            aria-label={t('cloud_region')}
          >
            {cloudRegions.map(({ id, display_name = '' }: CloudRegion, index) => (
              <FormSelectOption key={index} value={id} label={id ? t(id) : display_name} />
            ))}
          </FormSelect>
        </FormGroup>
        <FormGroup label={t('availabilty_zones')} fieldId="availability-zones">
          <ToggleGroup aria-label={t('availability_zone_selection')}>
            <Tooltip content={t('kafkaInstance.availabilty_zones_tooltip_message')}>
              <ToggleGroupItem
                text={t('single')}
                value={'single'}
                isDisabled
                buttonId="single"
                onChange={onChangeAvailabilty}
              />
            </Tooltip>
            <ToggleGroupItem
              text={t('multi')}
              value="multi"
              buttonId="multi"
              isSelected={isMultiSelected}
              onChange={onChangeAvailabilty}
            />
            <Tooltip
              content={t('kafkaInstance.availabilty_zones_tooltip_message')}
              reference={() => document.getElementById('multi') || document.createElement('span')}
            />
          </ToggleGroup>
        </FormGroup> */}
      </Form>
    );
  };

  const { store, hideModal } = useRootModalContext();
  const { onCreate, refresh, cloudProviders } = store?.modalProps || {};

  const handleModalToggle = () => {
    hideModal();
    //resetForm();
  };

  const onCreateInstance = () => {};

  return (
    <MASCreateModal
      isModalOpen={true}
      title={t('create_a_kafka_instance')}
      handleModalToggle={handleModalToggle}
      onCreate={onCreateInstance}
      isFormValid={isValid}
      primaryButtonTitle={t('create_instance')}
      isCreationInProgress={false}
      dataTestIdSubmit="modalCreateKafka-buttonSubmit"
      dataTestIdCancel="modalCreateKafka-buttonCancel"
    >
      <Alert
        className="pf-u-mb-md"
        variant="info"
        title="Your preview instance will expire after 48 hours."
        aria-live="polite"
        isInline
      />
      <Flex direction={{ default: 'column', lg: 'row' }}>
        <FlexItem flex={{ default: 'flex_2' }}>{createInstanceForm()}</FlexItem>
        <Divider isVertical />
        <FlexItem flex={{ default: 'flex_1' }} className="mk--create-instance-modal__sidebar--content">
          <DrawerPanelContentInfo />
        </FlexItem>
      </Flex>
    </MASCreateModal>
  );
};

export default CreateInstanceReactHookForm;
