import React, { useContext, useEffect, useState, createContext } from 'react';
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
  Drawer,
  DrawerContent,
  DrawerContentBody,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { NewKafka, FormDataValidationState } from '../../../../models';
import AwsIcon from '@patternfly/react-icons/dist/js/icons/aws-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import './CreateInstanceModal.css';
import { useAlerts } from '@app/common/MASAlerts/MASAlerts';
import { AuthContext } from '@app/auth/AuthContext';
import { DefaultApi, CloudProvider, CloudRegion } from '../../../../../openapi';
import { useTranslation } from 'react-i18next';
import { ApiContext } from '@app/api/ApiContext';
import { isServiceApiError } from '@app/utils/error';
import { MAX_INSTANCE_NAME_LENGTH } from '@app/utils/utils';
import { DrawerPanelContentInfo } from './DrawerPanelContentInfo';
import { isValidToken, ErrorCodes } from '@app/utils';
import { MASCreateModal } from '@app/common/MASCreateModal/MASCreateModal';

export type CreateInstanceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onCreate: () => void;
  mainToggle: boolean;
  refresh: () => void;
  cloudProviders: Array<CloudProvider>;
};

const CreateInstanceModalContext = createContext<CreateInstanceModalProps>({
  isModalOpen: false,
  setIsModalOpen: () => {},
  onCreate: () => {},
  mainToggle: false,
  refresh: () => {},
  cloudProviders: [],
});

export const CreateInstanceModalProvider = CreateInstanceModalContext.Provider;
export const useCreateInstanceModal = () => useContext(CreateInstanceModalContext);

const emptyProvider: CloudProvider = {
  kind: 'Empty provider',
  id: 'please_select',
  display_name: 'Please Select',
  enabled: true,
};

const CreateInstanceModal: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { isModalOpen, setIsModalOpen, onCreate, cloudProviders, refresh, mainToggle } = useCreateInstanceModal();
  const authContext = useContext(AuthContext);
  const { basePath } = useContext(ApiContext);
  const { addAlert } = useAlerts();

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
  const [isCreationInProgress, setCreationInProgress] = useState(false);

  const resetForm = () => {
    setKafkaFormData({ ...kafkaFormData, name: '', multi_az: true });
    setIsFormValid(true);
    setNameValidated({ fieldState: 'default' });
    setCreationInProgress(false);
  };

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
        addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason);
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

  const validateCreateForm = () => {
    let isValid = true;
    const { name, region } = kafkaFormData;
    if (!name || name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    } else if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: t('create_instance_name_invalid_helper_text') });
    }
    if (name.length > MAX_INSTANCE_NAME_LENGTH) {
      isValid = false;
      setNameValidated({
        fieldState: 'error',
        message: t('length_is_greater_than_expected', { maxLength: MAX_INSTANCE_NAME_LENGTH }),
      });
    }
    if (!region || region.trim() === '') {
      isValid = false;
      setCloudRegionValidated({ fieldState: 'error', message: t('common.this_is_a_required_field') });
    }
    return isValid;
  };

  const onCreateInstance = async () => {
    let isValid = validateCreateForm();

    const accessToken = await authContext?.getToken();
    if (!isValid) {
      setIsFormValid(false);
    } else {
      if (isValidToken(accessToken)) {
        try {
          const apisService = new DefaultApi({
            accessToken,
            basePath,
          });
          onCreate();
          setCreationInProgress(true);
          await apisService.createKafka(true, kafkaFormData).then((res) => {
            resetForm();
            setIsModalOpen(false);
            refresh();
          });
        } catch (error) {
          let reason: string | undefined;
          let toShowAlert = true;
          if (isServiceApiError(error)) {
            if (error.response?.data.code === ErrorCodes.DUPLICATE_INSTANCE_NAME) {
              setIsFormValid(false);
              toShowAlert = false;
              setNameValidated({
                fieldState: 'error',
                message: t('the_name_already_exists_please_enter_a_unique_name', { name: kafkaFormData.name }),
              });
            } else {
              reason = error.response?.data.reason;
            }
          }
          /**
           * Todo: show user friendly message according to server code
           * and translation for specific language
           *
           */
          toShowAlert && addAlert(t('common.something_went_wrong'), AlertVariant.danger, reason, 'toastCreateKafka-failed');
        }
        setCreationInProgress(false);
      }
    }
  };

  const handleModalToggle = () => {
    resetForm();
    setIsModalOpen(!isModalOpen);
  };

  const handleInstanceNameChange = (name?: string) => {
    let isValid = true;
    if (name === undefined || name.trim() === '') {
      isValid = true;
    } else if (name && !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(name.trim())) {
      isValid = false;
    }

    setKafkaFormData({ ...kafkaFormData, name: name || '' });
    if (name && name.length > MAX_INSTANCE_NAME_LENGTH) {
      setNameValidated({
        fieldState: 'error',
        message: t('length_is_greater_than_expected', { maxLength: MAX_INSTANCE_NAME_LENGTH }),
      });
    } else {
      if (isValid) {
        if (nameValidated.fieldState === 'error' && cloudRegionValidated.fieldState !== 'error') setIsFormValid(true);
        if (nameValidated.fieldState === 'error') {
          setNameValidated({ fieldState: 'default', message: '' });
        }
      } else {
        setNameValidated({ fieldState: 'error', message: t('create_instance_name_invalid_helper_text') });
      }
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

  const onChangeAvailabilty = (isSelected: boolean, event) => {
    if (isSelected) {
      const value = event.currentTarget.id;
      setKafkaFormData({ ...kafkaFormData, multi_az: value === 'multi' });
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
            <Alert variant="danger" title={t('common.create_instance_invalid_alert')} aria-live="polite" isInline />
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
            value={name}
            onChange={handleInstanceNameChange}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup label={t('cloud_provider')} fieldId="form-cloud-provider-name">
          {cloudProviders.map(
            (provider: CloudProvider) =>
              provider.enabled && (
                <Tile
                  key={`tile-${provider.name}`}
                  title={provider?.display_name || ''}
                  icon={getTileIcon(provider?.name)}
                  isSelected={cloud_provider === provider.name}
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
            value={region}
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
            <ToggleGroupItem
              text={t('single')}
              value={'single'}
              isDisabled
              buttonId="single"
              isSelected={isMultiSelected}
              onChange={onChangeAvailabilty}
            />
            <ToggleGroupItem
              text={t('multi')}
              value="multi"
              buttonId="multi"
              isSelected={isMultiSelected}
              onChange={onChangeAvailabilty}
            />
          </ToggleGroup>
        </FormGroup>
      </Form>
    );
  };

  return (
    <MASCreateModal
      isModalOpen={isModalOpen}
      title={t('create_a_kafka_instance')}
      handleModalToggle={handleModalToggle}
      onCreate={onCreateInstance}
      isFormValid={isFormValid}
      primaryButtonTitle={t('create_instance')}
      isCreationInProgress={isCreationInProgress}
      dataTestIdSubmit="modalCreateKafka-buttonSubmit"
      dataTestIdCancel="modalCreateKafka-buttonCancel"
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
    </MASCreateModal>
  );
};

export { CreateInstanceModal };
