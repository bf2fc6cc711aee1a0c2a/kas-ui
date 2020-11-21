import React, { useState } from 'react';
import {
  Button,
  Title,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Tile,
  FormSelect,
  FormSelectOption,
  Switch,
  SplitItem,
  Split,
  FormAlert,
  Alert,
} from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import axios from 'axios';
import { Services } from '../../common/app-config';
import { NewKafka } from '../../models/models';
import { AwsIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import './modal.css';
type CreateInstanceModalProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
};

type InstanceFormData = {
  instanceName?: string;
  cloudProvider: string;
  cloudRegion: string;
  isMultipleZonesAvailable: boolean;
};
// const fetchKafkas = async () => {
//   await apisService.listKafkas()
const cloudRegionOptions = [
  { value: '', label: 'Please Choose', disabled: false },
  { value: 'us-east-1', label: 'US East, N. Virginia', disabled: false },
];

const CreateInstanceModal: React.FunctionComponent<CreateInstanceModalProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  mainToggle,
}: CreateInstanceModalProps) => {
  const [instanceFormData, setInstanceFormData] = useState<InstanceFormData>({
    cloudProvider: 'aws',
    cloudRegion: 'us-east-1',
    isMultipleZonesAvailable: false,
  });
  const [nameValidated, setNameValidated] = useState<'success' | 'warning' | 'error' | 'default' | undefined>(
    'default'
  );
  const [cloudRegionValidated, setCloudRegionValidated] = useState<
    'success' | 'warning' | 'error' | 'default' | undefined
  >('success');

  const apisService = Services.getInstance().apiService;

  const onCreateInstance = async (event) => {
    let isValid = true;
    if (
      instanceFormData.instanceName === undefined ||
      instanceFormData.instanceName.trim() === '' ||
      !/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(instanceFormData.instanceName.trim())
    ) {
      isValid = false;
      setNameValidated('error');
    }
    if (instanceFormData.cloudRegion === undefined || instanceFormData.cloudRegion.trim() === '') {
      isValid = false;
      setCloudRegionValidated('error');
    }
    if (isValid) {
      // Check if the event is not empty

      // Update this to use the values from the event
      const newKafka: NewKafka = new NewKafka();
      newKafka.name = 'test';
      newKafka.multi_az = false;
      newKafka.owner = 'test';
      newKafka.region = 'test';
      newKafka.cloud_provider = 'test';

      await apisService
        .createKafka(true, newKafka)
        .then((res) => {
          console.info('Kafka was successfully created');
          handleModalToggle();
          // TO DO: User needs to know what Kafka was successfully created
        })
        .catch((error) => {
          console.error('Error creating Kafka');
          // TO DO: Set up error handling
        });
    }
  };

  const handleModalToggle = () => {
    setCreateStreamsInstance(!createStreamsInstance);
  };

  const handleInstanceNameChange = (name?: string) => {
    setInstanceFormData({ ...instanceFormData, instanceName: name });
    setNameValidated(
      name === undefined || name.trim() === ''
        ? 'error'
        : /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(name.trim())
        ? 'success'
        : 'error'
    );
  };
  const handleCloudRegionChange = (region: string, _event: any) => {
    setCloudRegionValidated(region === undefined || region === '' ? 'error' : 'success');
    setInstanceFormData({ ...instanceFormData, cloudRegion: region });
  };
  const handleMultipleZoneSwitch = () => {
    setInstanceFormData({ ...instanceFormData, isMultipleZonesAvailable: !instanceFormData.isMultipleZonesAvailable });
  };

  const isFormValid = nameValidated !== 'error' && cloudRegionValidated !== 'error';
  return (
    <>
      <Modal
        variant={ModalVariant.medium}
        title="Create a Streams Instance"
        isOpen={createStreamsInstance}
        onClose={handleModalToggle}
        actions={[
          <Button key="create" variant="primary" onClick={onCreateInstance} isDisabled={!isFormValid}>
            Create instance
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          {(nameValidated === 'error' || cloudRegionValidated === 'error') && (
            <FormAlert>
              <Alert
                variant="danger"
                title="You must fill out all required fields before you can proceed."
                aria-live="polite"
                isInline
              />
            </FormAlert>
          )}
          <FormGroup
            label="Instance name"
            helperTextInvalid="This is required field"
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            isRequired
            validated={nameValidated}
            fieldId="form-instance-name"
          >
            <TextInput
              isRequired
              validated={nameValidated}
              type="text"
              id="form-instance-name"
              name="form-instance-name"
              value={instanceFormData?.instanceName}
              onChange={handleInstanceNameChange}
            />
          </FormGroup>
          <FormGroup label="Cloud Provider" fieldId="form-cloud-provider-name">
            <Tile
              title=""
              isSelected={instanceFormData.cloudProvider === 'aws'}
              onClick={() => setInstanceFormData({ ...instanceFormData, cloudProvider: 'aws' })}
            >
              <Split hasGutter>
                <SplitItem>
                  <AwsIcon size="xl" />
                </SplitItem>
                <SplitItem className="pf-tile-split-title">Amazon Web Services</SplitItem>
              </Split>
            </Tile>
          </FormGroup>
          <FormGroup
            label="Cloud Region"
            helperTextInvalid="This is required field"
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            validated={cloudRegionValidated}
            fieldId="form-cloud-region-option"
          >
            <FormSelect
              validated={cloudRegionValidated}
              value={instanceFormData.cloudRegion}
              onChange={handleCloudRegionChange}
              id="cloud-region-select"
              name="cloud-region"
              aria-label="Cloud region"
            >
              {cloudRegionOptions.map((option, index) => (
                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Multiple availabilty zones" fieldId="form-cloud-provider-name">
            <Switch
              // TODO: API doesn't return anything about whether this option is enabled
              // making this as disbaled for now
              isDisabled={true}
              id="multiple-zone-avail-switch"
              aria-label="multiple avialabilty zones"
              isChecked={instanceFormData.isMultipleZonesAvailable}
              onClick={handleMultipleZoneSwitch}
            />
          </FormGroup>
        </Form>
        <br />
        <br />
      </Modal>
    </>
  );
};

export { CreateInstanceModal };
