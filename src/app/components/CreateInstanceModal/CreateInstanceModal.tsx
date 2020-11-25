import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Tile,
  FormSelect,
  FormSelectOption,
  FormAlert,
  Alert,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { Services } from '../../common/app-config';
import { NewKafka, FormDataValidationState } from '../../models/models';
import { AwsIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

type CreateInstanceModalProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
};

// const fetchKafkas = async () => {
//   await apisService.listKafkas()
const cloudRegionOptions = [
  { value: '', label: 'Please select ', disabled: false },
  { value: 'us-east-1', label: 'US East, N. Virginia', disabled: false },
];

const CreateInstanceModal: React.FunctionComponent<CreateInstanceModalProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
}: CreateInstanceModalProps) => {
  const newKafka: NewKafka = new NewKafka();
  newKafka.name = '';
  newKafka.cloud_provider = 'aws';
  newKafka.region = 'us-east-1';
  newKafka.multi_az = true;
  const [kafkaFormData, setKafkaFormData] = useState<NewKafka>(newKafka);
  const [nameValidated, setNameValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const [cloudRegionValidated, setCloudRegionValidated] = useState<FormDataValidationState>({ fieldState: 'default' });
  const apisService = Services.getInstance().apiService;

  const onCreateInstance = async (event) => {
    let isValid = true;
    if (kafkaFormData.name === undefined || kafkaFormData.name.trim() === '') {
      isValid = false;
      setNameValidated({ fieldState: 'error', message: 'This is a required field' });
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(kafkaFormData.name.trim())) {
      isValid = false;
      setNameValidated({
        fieldState: 'error',
        message: 'Valid characters for instance name are letters from a to z and numbers from 0 to 9.',
      });
    }
    if (kafkaFormData.region === undefined || kafkaFormData.region.trim() === '') {
      isValid = false;
      setCloudRegionValidated({ fieldState: 'error', message: 'This is a required field' });
    }
    if (isValid) {
      // Check if the event is not empty

      // Update this to use the values from the event
      await apisService
        .createKafka(true, kafkaFormData)
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
    setKafkaFormData({ ...kafkaFormData, name: name || '' });
    setNameValidated(
      name === undefined || name.trim() === ''
        ? { fieldState: 'error', message: 'This is a required field' }
        : /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/.test(name.trim())
        ? { fieldState: 'success', message: '' }
        : {
            fieldState: 'error',
            message: 'Valid characters for instance name are letters from a to z and numbers from 0 to 9.',
          }
    );
  };

  const handleCloudRegionChange = (region: string) => {
    setCloudRegionValidated(
      region === undefined || region === ''
        ? { fieldState: 'error', message: 'This is a required field' }
        : { fieldState: 'default', message: '' }
    );
    setKafkaFormData({ ...kafkaFormData, region: region });
  };

  const isFormValid = nameValidated.fieldState !== 'error' && cloudRegionValidated.fieldState !== 'error';

  return (
    <>
      <Modal
        variant={ModalVariant.medium}
        title="Create a Streams instance"
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
          {(nameValidated.fieldState === 'error' || cloudRegionValidated.fieldState === 'error') && (
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
          <FormGroup label="Cloud provider" fieldId="form-cloud-provider-name">
            <Tile
              title="Amazon Web Services"
              icon={<AwsIcon size="lg" />}
              isSelected={kafkaFormData.cloud_provider === 'aws'}
              onClick={() => setKafkaFormData({ ...kafkaFormData, cloud_provider: 'aws' })}
            />
          </FormGroup>
          <FormGroup
            label="Cloud region"
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
              aria-label="Cloud region"
            >
              {cloudRegionOptions.map((option, index) => (
                <FormSelectOption isDisabled={option.disabled} key={index} value={option.value} label={option.label} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Availabilty zones" fieldId="availability-zones">
            <ToggleGroup aria-label="Availability zone selection">
              <ToggleGroupItem
                text="Single"
                buttonId="single"
                isDisabled={true}
                isSelected={kafkaFormData.multi_az === false}
              />
              <ToggleGroupItem text="Multi" buttonId="multi" isSelected={kafkaFormData.multi_az === true} />
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
