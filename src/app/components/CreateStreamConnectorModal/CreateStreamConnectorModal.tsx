import { ApiContext } from '@app/api/ApiContext';
import { AuthContext } from '@app/auth/AuthContext';
import { Loading } from '@app/components/Loading/Loading';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  Text,
  TextArea,
  TextContent,
  TextInput,
  TextVariants,
  Tile,
  ToggleGroup,
  ToggleGroupItem,
  Wizard,
} from '@patternfly/react-core';
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { CloudProvider, CloudRegion, Connector, ConnectorType, ConnectorTypeList, DefaultApi } from 'src/openapi';
import RJForm, { IChangeEvent } from '@rjsf/core';
import { JSONSchema7 } from 'json-schema';
import { useTranslation } from 'react-i18next';
import { AwsIcon } from '@patternfly/react-icons';

type ConfigurationData = { [key: string]: string | number } | undefined;
type DetailsData = { name?: string; cloudProvider?: string; multiAZ?: boolean; region?: string } | undefined;

const DetailsForm: React.FunctionComponent<{
  cloudProviders: Array<CloudProvider>;
  configuredData: DetailsData;
  onConfig: (data: DetailsData) => void;
}> = memo(({ cloudProviders, configuredData = {}, onConfig }) => {
  const { t } = useTranslation();
  const getTileIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'aws':
        return <AwsIcon size="lg" color="black" className="mk--create-instance__tile--icon" />;
      default:
        return;
    }
  };

  return (
    <Form>
      <FormGroup
        label={t('instance_name')}
        helperText={t('create_instance_name_helper_text')}
        isRequired
        fieldId="form-instance-name"
      >
        <TextInput
          isRequired
          type="text"
          id="form-instance-name"
          name="instance-name"
          value={configuredData.name}
          onChange={(name) => onConfig({ ...configuredData, name })}
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
                isSelected={configuredData.cloudProvider === provider.name}
                onClick={() => onConfig({ ...configuredData, cloudProvider: provider.id })}
              />
            )
        )}
      </FormGroup>
      <FormGroup label={t('cloud_region')} fieldId="form-cloud-region-option">
        <FormSelect
          value={configuredData.region}
          onChange={(region) => onConfig({ ...configuredData, region })}
          id="cloud-region-select"
          name="cloud-region"
          aria-label={t('cloud_region')}
        >
          {[
            {
              kind: 'Empty provider',
              id: 'please_select',
              display_name: 'Please Select',
              enabled: true,
            },
            { id: 'us-east-1', display_name: 'US East, N. Virginia', enabled: true } as CloudRegion,
          ].map(
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
            isSelected={configuredData.multiAZ}
            onChange={(multiAZ) => onConfig({ ...configuredData, multiAZ })}
          />
          <ToggleGroupItem
            text={t('multi')}
            value="multi"
            buttonId="multi"
            isSelected={configuredData.multiAZ}
            onChange={(multiAZ) => onConfig({ ...configuredData, multiAZ })}
          />
        </ToggleGroup>
      </FormGroup>
    </Form>
  );
});
DetailsForm.displayName = 'DetailsForm';

const SpecForm: React.FunctionComponent<{
  type: ConnectorType;
  configuredData: ConfigurationData;
  onConfig: (data: ConfigurationData) => void;
}> = memo(({ type, configuredData, onConfig }) => {
  function onChange(e: IChangeEvent) {
    console.log(e);
    if (e.errors.length === 0) {
      onConfig(e.formData);
    } else {
      onConfig(undefined);
    }
  }
  return (
    <RJForm
      schema={type.json_schema as JSONSchema7}
      liveValidate={true}
      showErrorList={false}
      onChange={onChange}
      formData={configuredData || {}}
    >
      <div>{/* hide the default submit button */}</div>
    </RJForm>
  );
});
SpecForm.displayName = 'SpecForm';

const SelectConnector: React.FunctionComponent<{
  selectedType?: string;
  onSelect: (selected: ConnectorType) => void;
}> = ({ selectedType, onSelect }) => {
  const { basePath } = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [{ loading, types }, setTypes] = useState<{ loading: boolean; types?: ConnectorTypeList }>({
    loading: false,
  });

  const loadTypes = useCallback(async () => {
    setTypes({ loading: true, types: undefined });
    const accessToken = await authContext?.getToken();
    const apisService = new DefaultApi({
      accessToken,
      basePath,
    });
    const res = await apisService.listConnectorTypes();
    if (res.status === 200) {
      setTypes({ loading: false, types: res.data });
    } else {
      setTypes({ loading: false, types: undefined });
    }
  }, [authContext, basePath]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  function onSelectDataListItem(id: string) {
    const type = types?.items.find((t) => t.id === id);
    if (type) {
      onSelect(type);
    }
  }

  return (
    <DataList
      aria-label="Simple data list example"
      selectedDataListItemId={selectedType}
      onSelectDataListItem={onSelectDataListItem}
    >
      {loading ? (
        <Loading />
      ) : (
        types?.items.map((type) => (
          <DataListItem aria-labelledby="simple-item1" key={type.id} id={type.id}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="logo" isFilled={false}>
                    <img src="https://placekitten.com/50/50" />
                  </DataListCell>,
                  <DataListCell key="secondary content" isFilled>
                    <TextContent>
                      <Text component={TextVariants.h5}>{type.name}</Text>
                      <Text>{type.description}</Text>
                    </TextContent>
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        ))
      )}
    </DataList>
  );
};

export interface CreateStreamConnectorModalProps {
  cloudProviders: Array<CloudProvider>;
  kafkaId: string | false;
  onClose: () => void;
}
export const CreateStreamConnectorModal: React.FunctionComponent<CreateStreamConnectorModalProps> = ({
  cloudProviders,
  kafkaId,
  onClose,
}) => {
  const { basePath } = useContext(ApiContext);
  const authContext = useContext(AuthContext);
  const [selectedType, setSelectedType] = useState<ConnectorType | undefined>(undefined);
  const [configurationData, setConfigurationData] = useState<ConfigurationData>(undefined);
  const [detailsData, setDetailsData] = useState<DetailsData>(undefined);

  const connector: Connector = {
    kind: 'Connector',
    metadata: {
      name: detailsData?.name,
    },
    deployment_location: {
      cloud_provider: detailsData?.cloudProvider,
      multi_az: detailsData?.multiAZ,
      region: detailsData?.region,
    },
    connector_type_id: selectedType?.id,
    connector_spec: configurationData,
  };

  function onSelectType(type: ConnectorType) {
    setSelectedType(type);
    setConfigurationData(undefined);
  }

  async function createConnector() {
    if (kafkaId) {
      const accessToken = await authContext?.getToken();
      const apisService = new DefaultApi({
        accessToken,
        basePath,
      });
      await apisService.createConnector(kafkaId, true, connector);
      onClose();
    }
  }

  useEffect(() => {
    setSelectedType(undefined);
    setConfigurationData(undefined);
  }, [kafkaId]);

  const steps = [
    {
      name: 'Connector',
      component: <SelectConnector selectedType={selectedType?.id} onSelect={onSelectType} />,
      canJumpTo: true,
      enableNext: selectedType !== undefined,
    },
    {
      name: 'Configuration',
      component: selectedType ? (
        <SpecForm type={selectedType} configuredData={configurationData} onConfig={setConfigurationData} />
      ) : undefined,
      canJumpTo: selectedType !== undefined,
      enableNext: configurationData !== undefined,
    },
    {
      name: 'Details',
      component: configurationData ? (
        <DetailsForm cloudProviders={cloudProviders} configuredData={detailsData} onConfig={setDetailsData} />
      ) : undefined,
      canJumpTo: configurationData !== undefined,
      enableNext: detailsData !== undefined,
    },
    {
      name: 'Review',
      component: <TextArea isDisabled value={JSON.stringify(connector)} />,
      nextButtonText: 'Create connector',
      canJumpTo: configurationData !== undefined && detailsData !== undefined,
    },
  ];

  return (
    <Modal variant={ModalVariant.large} isOpen={kafkaId !== false} showClose={false} hasNoBodyWrapper>
      <Wizard
        title={'Create a connector'}
        description={
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias aliquam, minima ratione beatae quidem repellat molestiae aperiam velit architecto totam incidunt voluptate cupiditate exercitationem recusandae qui accusamus esse. At, odit.'
        }
        navAriaLabel={`Connector creation steps`}
        mainAriaLabel={`Connector creation content`}
        steps={steps}
        height={400}
        onSave={createConnector}
        onClose={onClose}
      />
    </Modal>
  );
};
