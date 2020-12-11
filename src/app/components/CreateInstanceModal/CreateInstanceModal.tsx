import React, { useContext, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  Form,
  FormAlert,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  TextInput,
  Tile,
  ToggleGroup,
} from '@patternfly/react-core';
import { FormDataValidationState, NewKafka } from '../../models/models';
import { AwsIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import './CreateInstanceModal.css';
import { useAlerts } from '../Alerts/Alerts';
import { AuthContext } from '@app/auth/AuthContext';
import { DefaultApi } from '../../../openapi';
import { cloudProviderOptions, cloudRegionOptions } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';

type CreateInstanceModalProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  refresh: () => void;
};

const CreateInstanceModal: React.FunctionComponent<CreateInstanceModalProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  refresh,
}: CreateInstanceModalProps) => {
  const { t, i18n } = useTranslation();
  const newKafka: NewKafka = new NewKafka();
  newKafka.name = '';
  newKafka.cloud_provider = 'aws';
  newKafka.region = 'us-east-1';
  newKafka.multi_az = true;
  const cloudRegionsAvailable = [{ value: 'please_select', label: 'please_select', disabled: false }, ...cloudRegionOptions];
  const [kafkaFormData, setKafkaFormData] = useState<NewKafka>(newKafka);
  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegionValidated, setCloudRegionValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const { getToken } = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const { addAlert } = useAlerts();

  const onCreateInstance = async () => {
    let isValid = true;

    if (kafkaFormData.name === undefined || kafkaFormData.name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('this_is_a_required_field') });
    }

    if (kafkaFormData.region === undefined || kafkaFormData.region.trim() === '') {
      isValid = false;
      setCloudRegionValidated({ fieldState: 'error', message: t('this_is_a_required_field') });
    }

    const accessToken = await getToken();

    if (isValid) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.createKafka(true, kafkaFormData).then((res) => {
          // addAlert(t('kafka_creation_accepted'), AlertVariant.info);
          handleModalToggle();
          refresh();
        });
      } catch (error) {
        let reason;
        if (isServiceApiError(error)) {
          reason = error.response?.data.reason;
        }
        /**
         * Todo: show user friendly message according to server code
         * and translation for specific language
         *
         */
        addAlert(t('something_went_wrong'), AlertVariant.danger, reason);
      }
    } else {
      setIsFormValid(false);
    }
  };

  const handleModalToggle = () => {
    setCreateStreamsInstance(!createStreamsInstance);
  };

  const handleInstanceNameChange = (name?: string) => {
    setKafkaFormData({ ...kafkaFormData, name: name || '' });
    if (nameValidated.fieldState === 'error' && cloudRegionValidated.fieldState !== 'error') setIsFormValid(true);
    if (nameValidated.fieldState === 'error') {
      setNameValidated({ fieldState: 'default', message: '' });
    }
  };

  const handleCloudRegionChange = (region: string) => {
    if (cloudRegionValidated.fieldState === 'error' && nameValidated.fieldState !== 'error') {
      setIsFormValid(true);
    }
    if (cloudRegionValidated.fieldState === 'error') {
      setCloudRegionValidated({ fieldState: 'default', message: '' });
    }
    setKafkaFormData({ ...kafkaFormData, region: region });
  };

  const getTileIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'aws':
        return <AwsIcon size="lg" color="black" className="cloud-region-icon" />;
      default:
        return;
    }
  };
  const onChangeAvailabilty = (zone: string) => {
    setKafkaFormData({ ...kafkaFormData, multi_az: zone === 'multi' });
  };
  return (
    <>
      <Modal
        variant={ModalVariant.medium}
        title={t('create_a_streams_instance')}
        isOpen={createStreamsInstance}
        onClose={handleModalToggle}
        actions={[
          <Button key="create" variant="primary" onClick={onCreateInstance} isDisabled={!isFormValid}>
            {t('create_instance')}
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            {t('cancel')}
          </Button>,
        ]}
      >
        <Form>
          {!isFormValid && (
            <FormAlert>
              <Alert variant="danger" title={t('create_instance_invalid_alert')} aria-live="polite" isInline />
            </FormAlert>
          )}
          <FormGroup
            label={t('instance_name')}
            helperTextInvalid={nameValidated.message}
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            isRequired
            validated={nameValidated.fieldState}
            fieldId="form-instance-name"
          >
            <TextInput
              isRequired
              validated={nameValidated.fieldState}
              type="text"
              id="form-instance-name"
              name="instance-name"
              value={kafkaFormData?.name}
              onChange={handleInstanceNameChange}
            />
          </FormGroup>
          <FormGroup label={t('cloud_provider')} fieldId="form-cloud-provider-name">
            {cloudProviderOptions.map((provider) => (
              <Tile
                key={`tile-${provider.value}`}
                title={t(provider.label)}
                icon={getTileIcon(provider.value)}
                isSelected={kafkaFormData.cloud_provider === provider.value}
                onClick={() => setKafkaFormData({ ...kafkaFormData, cloud_provider: provider.value })}
              />
            ))}
          </FormGroup>
          <FormGroup
            label={t('cloud_region')}
            helperTextInvalid={cloudRegionValidated.message}
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            validated={cloudRegionValidated.fieldState}
            fieldId="form-cloud-region-option"
          >
            <FormSelect
              validated={cloudRegionValidated.fieldState}
              value={kafkaFormData.region}
              onChange={handleCloudRegionChange}
              id="cloud-region-select"
              name="cloud-region"
              aria-label={t('cloud_region')}
            >
              {cloudRegionsAvailable.map((option, index) => (
                <FormSelectOption key={index} value={option.value} label={t(option.value)} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label={t('availabilty_zones')} fieldId="availability-zones">
            <ToggleGroup aria-label={t('availability_zone_selection')}>
              {/*
                  TODO: Currently using HTML version
                  Issue: https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend/issues/24
              */}
              <div className="pf-c-toggle-group__item">
                <button
                  className={`pf-c-toggle-group__button ${kafkaFormData.multi_az === false && 'pf-m-selected'}`}
                  type="button"
                  id="single"
                  disabled
                  onClick={() => {
                    onChangeAvailabilty('single');
                  }}
                >
                  <span className="pf-c-toggle-group__text"> {t('single')}</span>
                </button>
              </div>
              <div className="pf-c-toggle-group__item">
                <button
                  className={`pf-c-toggle-group__button ${kafkaFormData.multi_az === true && 'pf-m-selected'}`}
                  type="button"
                  onClick={() => {
                    onChangeAvailabilty('multi');
                  }}
                  id="multi"
                >
                  <span className="pf-c-toggle-group__text"> {t('multi')}</span>
                </button>
              </div>
            </ToggleGroup>
          </FormGroup>
        </Form>
        <br />
        <br />
      </Modal>
    </>
  );
};

export { CreateInstanceModal };
