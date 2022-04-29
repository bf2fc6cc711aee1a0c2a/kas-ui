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
import { useAvailableProvidersAndDefault, useCreateInstance } from "./api";

const CreateInstanceWithSizes: FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal, onCreate }) => {
  const fetchAvailableProvidersAndDefault = useAvailableProvidersAndDefault();
  const createInstance = useCreateInstance();
  const qsContext = useContext(QuickStartContext);

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

  const getSizes = useCallback<CreateKafkaInstancePropsWithSizes["getSizes"]>(
    async (provider, region) => {
      console.log(provider, region);
      return Promise.resolve({
        sizes: [
          {
            id: "x1",
            streamingUnits: 1,
            ingress: 3,
            egress: 31,
            storage: 5,
            connections: 6,
            connectionRate: 7,
            maxPartitions: 8,
            messageSize: 9,
          },
          {
            id: "x2",
            streamingUnits: 2,
            ingress: 30,
            egress: 301,
            storage: 50,
            connections: 60,
            connectionRate: 70,
            maxPartitions: 80,
            messageSize: 90,
          },
          {
            id: "x3",
            streamingUnits: 5,
            ingress: 300,
            egress: 3001,
            storage: 500,
            connections: 600,
            connectionRate: 700,
            maxPartitions: 800,
            messageSize: 900,
          },
        ],
      });
    },
    []
  );

  return (
    <CreateKafkaInstanceWithSizes
      isModalOpen={true}
      onClickQuickStart={onClickQuickStart}
      onCancel={hideModal}
      getAvailableProvidersAndDefaults={getAvailableProvidersAndDefaults}
      onCreate={handleCreate}
      onClickContactUs={() => console.log("")}
      onClickLearnMoreAboutRegions={() => console.log("")}
      onLearnHowToAddStreamingUnits={() => console.log("")}
      onLearnMoreAboutSizes={() => console.log("")}
      onClickKafkaOverview={() => console.log("")}
      getSizes={getSizes}
    />
  );
};

export { CreateInstanceWithSizes };
export default CreateInstanceWithSizes;
