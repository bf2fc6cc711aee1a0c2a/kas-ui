import { useHistory } from "react-router-dom";
import {
  CreateKafkaInstancePropsWithSizes,
  CreateKafkaInstanceWithSizes,
  CreateKafkaInstanceWithSizesTypes,
} from "@rhoas/app-services-ui-components";
import {
  BaseModalProps,
  CreateInstanceProps,
} from "@rhoas/app-services-ui-shared";
import { QuickStartContext } from "@patternfly/quickstarts";
import { FunctionComponent, useCallback, useContext } from "react";
import {
  useGetAvailableSizes,
  useCreateInstance,
  useAvailableProvidersAndDefault,
} from "./hooks/";

const CreateInstanceWithSizes: FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal, onCreate }) => {
  const history = useHistory();
  const fetchAvailableProvidersAndDefault = useAvailableProvidersAndDefault();
  const getKafkaSizes = useGetAvailableSizes();
  const createInstance = useCreateInstance();
  const qsContext = useContext(QuickStartContext);

  const onClickKafkaOverview = () => {
    history.push(`overview`);
  };

  const onClickQuickStart = useCallback(() => {
    qsContext.setActiveQuickStart &&
      qsContext.setActiveQuickStart("getting-started");
  }, [qsContext]);

  const handleCreate =
    useCallback<CreateKafkaInstanceWithSizesTypes.OnCreateKafka>(
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
    useCallback(async (): Promise<CreateKafkaInstanceWithSizesTypes.CreateKafkaInitializationData> => {
      return fetchAvailableProvidersAndDefault();
    }, [fetchAvailableProvidersAndDefault]);

  const kafkaSizes = useCallback<CreateKafkaInstancePropsWithSizes["getSizes"]>(
    getKafkaSizes,
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
    />
  );
};

export { CreateInstanceWithSizes };
export default CreateInstanceWithSizes;
