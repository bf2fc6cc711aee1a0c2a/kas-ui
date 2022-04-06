import {
  CreateKafkaInstance,
  CreateKafkaInitializationData,
  OnCreateKafka,
} from "@rhoas/app-services-ui-components";
import {
  BaseModalProps,
  CreateInstanceProps,
} from "@rhoas/app-services-ui-shared";
import { QuickStartContext } from "@patternfly/quickstarts";
import React, { useCallback, useContext } from "react";
import { getModalAppendTo } from "@app/utils";
import { useAvailableProvidersAndDefault, useCreateInstance } from "./api";

const CreateInstance: React.FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal, onCreate }) => {
  const fetchAvailableProvidersAndDefault = useAvailableProvidersAndDefault();
  const createInstance = useCreateInstance();
  const qsContext = useContext(QuickStartContext);

  const onClickQuickStart = useCallback(() => {
    qsContext.setActiveQuickStart &&
      qsContext.setActiveQuickStart("getting-started");
  }, []);

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
      return fetchAvailableProvidersAndDefault();
    }, []);

  return (
    <CreateKafkaInstance
      isModalOpen={true}
      onClickQuickStart={onClickQuickStart}
      onCancel={hideModal}
      getAvailableProvidersAndDefaults={getAvailableProvidersAndDefaults}
      onCreate={handleCreate}
      appendTo={getModalAppendTo}
    />
  );
};

export { CreateInstance };
export default CreateInstance;
