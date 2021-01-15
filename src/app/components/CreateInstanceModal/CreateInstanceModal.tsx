import React, { useContext, useEffect, useState } from 'react';
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
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core';
import { FormDataValidationState, NewKafka } from '../../models/models';
import { AwsIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import './CreateInstanceModal.css';
import { useAlerts } from '../Alerts/Alerts';
import { AuthContext } from '@app/auth/AuthContext';
import { DefaultApi, CloudProvider, CloudRegion } from '../../../openapi';
import { useTranslation } from 'react-i18next';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';
import { DrawerPanelContentInfo } from './DrawerPanelContentInfo';

type CreateInstanceModalProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  refresh: (operation: string) => void;
  cloudProviders: Array<CloudProvider>;
};

const emptyProvider: CloudProvider = {
  kind: 'Empty provider',
  id: 'please_select',
  display_name: 'Please Select',
  enabled: true,
};

const CreateInstanceModal: React.FunctionComponent<CreateInstanceModalProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  cloudProviders,
  refresh,
  mainToggle,
}: CreateInstanceModalProps) => {
  const { t } = useTranslation();
  const newKafka: NewKafka = new NewKafka();
  newKafka.name = '';
  newKafka.cloud_provider = '';
  newKafka.region = '';
  newKafka.multi_az = true;
  const [kafkaFormData, setKafkaFormData] = useState<NewKafka>(newKafka);
  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegionValidated, setCloudRegionValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegions, setCloudRegions] = useState<CloudRegion[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);

  const { addAlert } = useAlerts();

  // Function to fetch cloud Regions based on selected filter
  const fetchCloudRegions = async (provider: CloudProvider) => {
    const accessToken = await authContext?.getToken();
    const id = provider.id;
    if (accessToken !== undefined && accessToken !== '' && id) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.listCloudProviderRegions(id).then((res) => {
          const providerRegions = res.data;
          const providers: CloudProvider[] = [emptyProvider].concat(providerRegions.items);
          setCloudRegions(providerRegions.items != null ? providers : []);
          const enabledRegions = providerRegions.items.filter((provider: CloudProvider) => provider.enabled);
          if (enabledRegions.length === 1 && enabledRegions[0].id && provider.name) {
            const region: string = enabledRegions[0].id;
            setKafkaFormData((prevData) => ({ ...prevData, region }));
          }
        });
      } catch (error) {
        let reason: string | undefined;
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
    }
  };

  useEffect(() => {
    const enableCloudProviders: CloudProvider[] = cloudProviders.filter((provider: CloudProvider) => provider.enabled);
    if (enableCloudProviders.length > 0 && enableCloudProviders[0].name) {
      setKafkaFormData({ ...kafkaFormData, cloud_provider: enableCloudProviders[0].name });
      fetchCloudRegions(enableCloudProviders[0]);
    }
  }, [cloudProviders]);

  const onCloudProviderSelect = (cloudProvider: CloudProvider) => {
    cloudProvider.name && setKafkaFormData({ ...kafkaFormData, cloud_provider: cloudProvider.name });
    fetchCloudRegions(cloudProvider);
  };

  const onCreateInstance = async () => {
    let isValid = true;

    if (kafkaFormData.name === undefined || kafkaFormData.name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('this_is_a_required_field') });
    } else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(kafkaFormData.name.trim())) {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('create_instance_name_invalid_helper_text') });
    }

    if (kafkaFormData.region === undefined || kafkaFormData.region.trim() === '') {
      isValid = false;
      setCloudRegionValidated({ fieldState: 'error', message: t('this_is_a_required_field') });
    }

    const accessToken = await authContext?.getToken();

    if (isValid) {
      try {
        const apisService = new DefaultApi({
          accessToken,
          basePath,
        });
        await apisService.createKafka(true, kafkaFormData).then((res) => {
          // addAlert(t('kafka_creation_accepted'), AlertVariant.info);
          handleModalToggle();
          refresh('create');
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
    let isValid = true;
    if (name === undefined || name.trim() === '') {
      isValid = true;
    } else if (name && !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
    }
    setKafkaFormData({ ...kafkaFormData, name: name || '' });
    if (isValid) {
      if (nameValidated.fieldState === 'error' && cloudRegionValidated.fieldState !== 'error') setIsFormValid(true);
      if (nameValidated.fieldState === 'error') {
        setNameValidated({ fieldState: 'default', message: '' });
      }
    } else {
      setNameValidated({ fieldState: 'error', message: t('create_instance_name_invalid_helper_text') });
    }
  };

  const handleCloudRegionChange = (region: string) => {
    let validRegion: string = region;
    if (region === 'please_select') {
      validRegion = '';
    }
    if (cloudRegionValidated.fieldState === 'error' && nameValidated.fieldState !== 'error') {
      setIsFormValid(true);
    }
    if (cloudRegionValidated.fieldState === 'error') {
      setCloudRegionValidated({ fieldState: 'default', message: '' });
    }
    setKafkaFormData({ ...kafkaFormData, region: validRegion });
  };

  const getTileIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'aws':
        return <AwsIcon size="lg" color="black" className="mk--create-instance__tile--icon" />;
      default:
        return;
    }
  };
  const onChangeAvailabilty = (zone: string) => {
    setKafkaFormData({ ...kafkaFormData, multi_az: zone === 'multi' });
  };

  const createInstanceForm = () => {
    const { message, fieldState } = nameValidated;
    return (
      <Form>
        {!isFormValid && (
          <FormAlert>
            <Alert variant="danger" title={t('create_instance_invalid_alert')} aria-live="polite" isInline />
          </FormAlert>
        )}
        <FormGroup
          label={t('instance_name')}
          helperText={t('create_instance_name_helper_text')}
          helperTextInvalid={message}
          helperTextInvalidIcon={message != '' && <ExclamationCircleIcon />}
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
            value={kafkaFormData?.name}
            onChange={handleInstanceNameChange}
          />
        </FormGroup>
        <FormGroup label={t('cloud_provider')} fieldId="form-cloud-provider-name">
          {cloudProviders.map(
            (provider: CloudProvider) =>
              provider.enabled && (
                <Tile
                  key={`tile-${provider.name}`}
                  title={provider.display_name ? t(provider.display_name) : ''}
                  icon={getTileIcon(provider?.name)}
                  isSelected={kafkaFormData.cloud_provider === provider.name}
                  onClick={() => onCloudProviderSelect(provider)}
                />
              )
          )}
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
            {cloudRegions.map(
              (option: CloudRegion, index) =>
                option.enabled && (
                  <FormSelectOption
                    key={index}
                    value={option.id}
                    label={option.id ? t(option.id) : option.display_name || ''}
                  />
                )
            )}
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
    );
  };

  return (
    <>
      <Modal
        variant={ModalVariant.medium}
        title={t('create_a_kafka_instance')}
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
        {mainToggle === true ? (
          <Drawer isStatic className="mk--create-instance-modal__drawer--content">
            <DrawerContent panelContent={<DrawerPanelContentInfo />}>
              <DrawerContentBody>{createInstanceForm()}</DrawerContentBody>
            </DrawerContent>
          </Drawer>
        ) : (
          createInstanceForm()
        )}
        <br />
        <br />
      </Modal>
    </>
  );
};

export { CreateInstanceModal };
