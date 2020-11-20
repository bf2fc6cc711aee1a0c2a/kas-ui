import React, { useState } from 'react';
import {
  Button,
  Title,
  Modal as PFModal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Tile,
  FormSelect,
  FormSelectOption,
  Switch,
} from '@patternfly/react-core';
import { KafkaRequestAllOf } from '../../../openapi/api';
import axios from 'axios';
import { Services } from '../../common/app-config';
import { NewKafka } from '../../models/models';
import { AwsIcon } from '@patternfly/react-icons';

type ModalProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
};

type FormState = {
  instanceName?: string;
  cloudProvider: string;
  cloudRegion: string;
  isMultipleZonesAvailable: boolean;
};
// const fetchKafkas = async () => {
//   await apisService.listKafkas()
const cloudRegionOptions = [
  { value: 'please choose', label: 'Please Choose', disabled: false },
  { value: 'mr', label: 'Mr', disabled: false },
];

const Modal: React.FunctionComponent<ModalProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  mainToggle,
}: ModalProps) => {
  const [formState, setFormState] = useState<FormState>({
    cloudProvider: 'aws',
    cloudRegion: 'us-east',
    isMultipleZonesAvailable: false,
  });
  const apisService = Services.getInstance().apiService;

  const onCreateInstance = async (event) => {
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
  };

  const handleModalToggle = () => {
    setCreateStreamsInstance(!createStreamsInstance);
  };

  const handleInstanceNameChange = (name?: string) => {
    setFormState({ ...formState, instanceName: name });
  };
  const handleCloudRegionChange = (region: string, _event: any) => {
    setFormState({ ...formState, cloudRegion: region });
  };
  const handleMultipleZoneSwitch = () => {
    setFormState({ ...formState, isMultipleZonesAvailable: !formState.isMultipleZonesAvailable });
  };
  return (
    <>
      <PFModal
        variant={ModalVariant.large}
        title="Create a Streams Instance"
        isOpen={createStreamsInstance}
        onClose={handleModalToggle}
        actions={[
          <Button key="create" variant="primary" onClick={onCreateInstance}>
            Create instance
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup label="Instance name" isRequired fieldId="form-instance-name">
            <TextInput
              isRequired
              type="text"
              id="form-instance-name"
              name="form-instance-name"
              value={formState?.instanceName}
              onChange={handleInstanceNameChange}
            />
          </FormGroup>
          <FormGroup label="Cloud Provider" fieldId="form-cloud-provider-name">
            <Tile
              isSelected={formState.cloudProvider === 'aws'}
              icon={<AwsIcon size="xl" />}
              title="Amazon Web Services"
              onClick={() => setFormState({ ...formState, cloudProvider: 'aws' })}
            />
          </FormGroup>
          <FormGroup label="Cloud Region" fieldId="form-cloud-region-option">
            <FormSelect
              value={formState.cloudRegion}
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
              id="multiple-zone-avail-switch"
              aria-label="multiple avialabilty zones"
              isChecked={formState.isMultipleZonesAvailable}
              onClick={handleMultipleZoneSwitch}
            />
          </FormGroup>
        </Form>
        <br />
        <br />
      </PFModal>
    </>
  );
};

export { Modal };
