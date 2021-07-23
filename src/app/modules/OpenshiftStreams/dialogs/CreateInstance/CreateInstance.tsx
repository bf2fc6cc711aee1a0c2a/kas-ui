import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { NewKafka, FormDataValidationState } from '@app/models';
import './CreateInstance.css';
import { DrawerPanelContentInfo } from './DrawerPanelContentInfo';
import { useAlert, useAuth, useConfig } from '@bf2/ui-shared';
import { useFederated, QuotaCost } from '@app/contexts';

const emptyProvider: CloudProvider = {
  kind: 'Empty provider',
  display_name: 'Please Select',
  enabled: true,
};

const CreateInstance: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { store, hideModal } = useRootModalContext();
  const { onCreate, refresh, cloudProviders } = store?.modalProps || {};
  const auth = useAuth();
  const {
    kas: { apiBasePath: basePath },
  } = useConfig();
  const { addAlert } = useAlert();
  const { getAMSQuotaCost } = useFederated();
  const newKafka: NewKafka = new NewKafka();

  const [kafkaFormData, setKafkaFormData] = useState<NewKafka>(newKafka);
  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegionValidated, setCloudRegionValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegions, setCloudRegions] = useState<CloudRegion[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isCreationInProgress, setCreationInProgress] = useState(false);
  const [quotaCost, setQuotaCost] = useState<QuotaCost>();
  const [isPreviewKafkaMaxLimitReached, setIsPreviewKafkaMaxLimitReached] = useState<boolean>();

  const resetForm = () => {
    setKafkaFormData((prevState) => ({ ...prevState, name: '', multi_az: true }));
    setIsFormValid(true);
    setNameValidated({ fieldState: 'default' });
    setCreationInProgress(false);
  };

  // Function to fetch cloud Regions based on selected filter
  const fetchCloudRegions = async (provider: CloudProvider) => {
    const accessToken = await auth?.kas.getToken();
    const id = provider.id;

    if (accessToken && id) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );
        await apisService.getCloudProviderRegions(id).then((res) => {
          const providerRegions = res.data?.items || [];
          const enabledRegions = providerRegions?.filter((p: CloudProvider) => p.enabled);
          //set default selected region if there is one region
          if (enabledRegions.length === 1 && enabledRegions[0].id && provider.name) {
            const region: string = enabledRegions[0].id;
            setKafkaFormData((prevState) => ({ ...prevState, region }));
          }
          //add empty provider on top in region list
          enabledRegions.unshift(emptyProvider);
          setCloudRegions(enabledRegions);
        });
      } catch (error) {
        let reason: string | undefined;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        addAlert({
          title: t('common.something_went_wrong'),
          variant: AlertVariant.danger,
          description: reason,
        });
      }
    }
  };

  useEffect(() => {
    if (cloudProviders?.length > 0 && cloudProviders[0].name) {
      setKafkaFormData((prevState) => ({ ...prevState, cloud_provider: cloudProviders[0].name }));
      fetchCloudRegions(cloudProviders[0]);
    }
  }, [cloudProviders]);

  const onCloudProviderSelect = (cloudProvider: CloudProvider) => {
    setKafkaFormData((prevState) => ({ ...prevState, cloud_provider: cloudProvider.name || '' }));
    fetchCloudRegions(cloudProvider);
  };

  const validateCreateForm = () => {
    let isValid = true;
    const { name, region } = kafkaFormData;
    //validate required field
    if (!name?.trim()) {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    }
    //validate regex
    else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('common.input_filed_invalid_helper_text') });
    }
    //validate max length
    if (name.length > MAX_INSTANCE_NAME_LENGTH) {
      isValid = false;
      setNameValidated({
        fieldState: 'error',
        message: t('length_is_greater_than_expected', { maxLength: MAX_INSTANCE_NAME_LENGTH }),
      });
    }
    //validate required field
    if (!region.trim()) {
      isValid = false;
      setCloudRegionValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    }
    return isValid;
  };

  const amsQuoataCost = async () => {
    if (getAMSQuotaCost) {
      const quotaResult: QuotaCost = await getAMSQuotaCost();
      setQuotaCost(quotaResult);
    }
  };

  useEffect(() => {
    amsQuoataCost();
  }, []);

  const onCreateInstance = async () => {
    const isValid = validateCreateForm();
    const accessToken = await auth?.kas.getToken();
    if (!isValid) {
      setIsFormValid(false);
      return;
    }
    await amsQuoataCost();
    const { allowed, consumed } = quotaCost || {};
    const quotaLimit = allowed - consumed;

    if (accessToken && (quotaLimit > 0 || allowed === 0)) {
      try {
        const apisService = new DefaultApi(
          new Configuration({
            accessToken,
            basePath,
          })
        );

        onCreate();
        setCreationInProgress(true);

        await apisService.createKafka(true, kafkaFormData).then(() => {
          resetForm();
          hideModal();
          refresh();
        });
      } catch (error) {
        if (isServiceApiError(error)) {
          const { code, reason } = error?.response?.data || {};

          if (code === ErrorCodes.DUPLICATE_INSTANCE_NAME) {
            setIsFormValid(false);
            setNameValidated({
              fieldState: 'error',
              message: t('the_name_already_exists_please_enter_a_unique_name', { name: kafkaFormData.name }),
            });
          } else if (code === ErrorCodes.PREVIEW_KAFKA_INSTANCE_EXIST) {
            setIsPreviewKafkaMaxLimitReached(true);
          } else {
            addAlert({
              title: t('common.something_went_wrong'),
              variant: AlertVariant.danger,
              description: reason,
              dataTestId: 'toastCreateKafka-failed',
            });
          }
        }

        setCreationInProgress(false);
      }
    }
  };

  const handleModalToggle = () => {
    hideModal();
    resetForm();
  };

  useEffect(() => {
    if (nameValidated.fieldState !== 'error' && cloudRegionValidated.fieldState !== 'error') {
      setIsFormValid(true);
    }
  }, [nameValidated.fieldState, cloudRegionValidated.fieldState]);

  const onChangeValidateName = (name: string) => {
    let isValid = true;
    setKafkaFormData((prevState) => ({ ...prevState, name }));

    if (name && !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
    }

    if (name?.length > MAX_INSTANCE_NAME_LENGTH) {
      setNameValidated({
        fieldState: 'error',
        message: t('length_is_greater_than_expected', { maxLength: MAX_INSTANCE_NAME_LENGTH }),
      });
    } else if (isValid && nameValidated.fieldState === 'error') {
      setNameValidated({ fieldState: 'default', message: '' });
    } else if (!isValid) {
      setNameValidated({ fieldState: 'error', message: t('common.input_filed_invalid_helper_text') });
    }
  };

  const onChangeCloudRegion = (region: string) => {
    setKafkaFormData((prevState) => ({ ...prevState, region }));
    if (region && cloudRegionValidated.fieldState === 'error') {
      setCloudRegionValidated({ fieldState: 'default', message: '' });
    }
  };

  const getTileIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'aws':
        return <AwsIcon size="lg" color="black" className="mk--create-instance__tile--icon" />;
      default:
        return;
    }
  };

  const onChangeAvailabilty = (isSelected: boolean, event) => {
    if (isSelected) {
      const value = event.currentTarget.id;
      setKafkaFormData((prevState) => ({ ...prevState, multi_az: value === 'multi' }));
    }
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    onCreateInstance();
  };

  const createInstanceForm = () => {
    const { message, fieldState } = nameValidated;
    const { name, cloud_provider, multi_az, region } = kafkaFormData;
    const isMultiSelected = multi_az;
    return (
      <Form onSubmit={onFormSubmit}>
        {!isFormValid && (
          <FormAlert>
            <Alert variant="danger" title={t('common.form_invalid_alert')} aria-live="polite" isInline />
          </FormAlert>
        )}
        <FormGroup
          label={t('instance_name')}
          helperText={t('create_instance_name_helper_text')}
          helperTextInvalid={message}
          isRequired
          validated={fieldState}
          fieldId="form-instance-name"
        >
          <TextInput
            isRequired
            validated={fieldState}
            type="text"
            id="form-instance-name"
            name="instance-name"
            value={name}
            onChange={onChangeValidateName}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup label={t('cloud_provider')} fieldId="form-cloud-provider-name">
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
                isSelected={isMultiSelected}
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
        </FormGroup>
      </Form>
    );
  };

  const renderAlert = () => {
    const { allowed, consumed } = quotaCost || {};
    const quotaLimit = allowed - consumed;
    if (quotaLimit === 0) {
      return (
        <Alert
          className="pf-u-mb-md"
          variant="danger"
          title={t('standard_kafka_alert_title')}
          aria-live="polite"
          isInline
        >
          {t('standard_kafka_alert_message')}
        </Alert>
      );
    } else if (allowed === 0 || isPreviewKafkaMaxLimitReached) {
      return (
        <Alert
          className="pf-u-mb-md"
          variant="warning"
          title={t('preview_kafka_alert_title')}
          aria-live="polite"
          isInline
        />
      );
    }
    return <></>;
  };

  const shouldDisabledButton = () => {
    const { allowed, consumed } = quotaCost || {};
    const quotaLimit = allowed - consumed;
    if (quotaLimit === 0 || isPreviewKafkaMaxLimitReached) {
      return true;
    }
    return false;
  };

  return (
    <MASCreateModal
      isModalOpen={true}
      title={t('create_a_kafka_instance')}
      handleModalToggle={handleModalToggle}
      onCreate={onCreateInstance}
      isFormValid={isFormValid}
      primaryButtonTitle={t('create_instance')}
      isCreationInProgress={isCreationInProgress}
      dataTestIdSubmit="modalCreateKafka-buttonSubmit"
      dataTestIdCancel="modalCreateKafka-buttonCancel"
      isDisabledButton={shouldDisabledButton()}
    >
      {renderAlert()}
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

export { CreateInstance };
