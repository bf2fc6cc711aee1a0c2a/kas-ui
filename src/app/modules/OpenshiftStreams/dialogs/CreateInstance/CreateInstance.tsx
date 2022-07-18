import { useHistory } from "react-router-dom";
import {
  CreateKafkaInitializationData,
  CreateKafkaInstancePropsWithSizes,
  CreateKafkaInstanceWithSizes,
  OnCreateKafka,
} from "@rhoas/app-services-ui-components";
import {
  BaseModalProps,
  CreateInstanceProps,
} from "@rhoas/app-services-ui-shared";
import { QuickStartContext } from "@patternfly/quickstarts";
import { getModalAppendTo } from "@app/utils";
import { FunctionComponent, useCallback, useContext, useRef } from "react";
import {
  useGetAvailableSizes,
  useCreateInstance,
  useAvailableProvidersAndDefault,
} from "./hooks";
import { AsyncReturnType } from "type-fest";

const CreateInstanceWithSizes: FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal, onCreate }) => {
  const history = useHistory();
  const fetchAvailableProvidersAndDefault = useAvailableProvidersAndDefault();
  const getKafkaSizes = useGetAvailableSizes();
  const createInstance = useCreateInstance();
  const qsContext = useContext(QuickStartContext);
  const capabilitiesRef =
    useRef<AsyncReturnType<typeof fetchAvailableProvidersAndDefault>>();

  const onClickKafkaOverview = () => {
    history.push(`overview`);
  };

  const onClickQuickStart = useCallback(() => {
    qsContext.setActiveQuickStart &&
      qsContext.setActiveQuickStart("getting-started");
  }, [qsContext]);

  const handleCreate = useCallback<OnCreateKafka>(
    function (data, onSuccess, onError) {
      const handleOnSuccess = () => {
        onSuccess();
        onCreate && onCreate();
        hideModal();
      };
      createInstance(data, handleOnSuccess, onError);
    },
    [hideModal, onCreate, createInstance]
  );

  const getAvailableProvidersAndDefaults =
    useCallback(async (): Promise<CreateKafkaInitializationData> => {
      const data = await fetchAvailableProvidersAndDefault();
      capabilitiesRef.current = data;
      return data;
    }, [fetchAvailableProvidersAndDefault]);

  const kafkaSizes = useCallback<CreateKafkaInstancePropsWithSizes["getSizes"]>(
    (provider, region) => {
      return new Promise((resolve, reject) => {
        const capabilities = capabilitiesRef.current;
        if (!capabilities) {
          reject("Unexpected error, missing provider data");
        } else {
          const providerInfo = capabilities.availableProviders.find(
            (p) => p.id === provider
          );
          const regionInfo = providerInfo?.regions.find((r) => r.id === region);
          const availableSizes =
            regionInfo?.capacity.flatMap((c) =>
              c.available_sizes.map((s) => `${c.instance_type}.${s}`)
            ) || [];
          resolve(getKafkaSizes(provider, region, availableSizes));
        }
      });
    },
    [getKafkaSizes]
  );

  return (
    <CreateKafkaInstanceWithSizes
      isModalOpen={true}
      onClickQuickStart={onClickQuickStart}
      onCancel={hideModal}
      getAvailableProvidersAndDefaults={getAvailableProvidersAndDefaults}
      onCreate={handleCreate}
      onClickContactUs={onClickKafkaOverview}
      onClickLearnMoreAboutRegions={onClickKafkaOverview}
      onLearnHowToAddStreamingUnits={onClickKafkaOverview}
      onLearnMoreAboutSizes={onClickKafkaOverview}
      onClickKafkaOverview={onClickKafkaOverview}
      getSizes={kafkaSizes}
      appendTo={getModalAppendTo}
    />
  );
};

export { CreateInstanceWithSizes };
export default CreateInstanceWithSizes;
