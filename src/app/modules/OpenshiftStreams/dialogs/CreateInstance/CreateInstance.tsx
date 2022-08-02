import { getModalAppendTo } from "@app/utils";
import { QuickStartContext } from "@patternfly/quickstarts";
import {
  CreateKafkaInstance,
  CreateKafkaInstanceServices,
} from "@rhoas/app-services-ui-components";
import {
  BaseModalProps,
  CreateInstanceProps,
} from "@rhoas/app-services-ui-shared";
import { FunctionComponent, useCallback, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  useCheckDeveloperAvailability,
  useCheckStandardQuota,
  useCreateInstance,
  useFetchProvidersWithRegions,
  useGetStandardSizes,
  useGetTrialSizes,
} from "./hooks";

const CreateInstance: FunctionComponent<
  CreateInstanceProps & BaseModalProps
> = ({ hideModal, onCreate }) => {
  const history = useHistory();
  const checkDeveloperAvailability = useCheckDeveloperAvailability();
  const checkStandardQuota = useCheckStandardQuota();
  const fetchProvidersWithRegions = useFetchProvidersWithRegions();
  const getStandardSizes = useGetStandardSizes();
  const getTrialSizes = useGetTrialSizes();
  const createInstance = useCreateInstance();
  const qsContext = useContext(QuickStartContext);

  const onClickKafkaOverview = () => {
    history.push(`overview`);
  };

  const onClickQuickStart = useCallback(() => {
    qsContext.setActiveQuickStart &&
      qsContext.setActiveQuickStart("getting-started");
  }, [qsContext]);

  const handleCreate = useCallback<CreateKafkaInstanceServices["onCreate"]>(
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

  return (
    <CreateKafkaInstance
      checkDeveloperAvailability={checkDeveloperAvailability}
      checkStandardQuota={checkStandardQuota}
      fetchProvidersWithRegions={fetchProvidersWithRegions}
      getStandardSizes={getStandardSizes}
      getTrialSizes={getTrialSizes}
      isModalOpen={true}
      onCancel={hideModal}
      onClickContactUs={onClickKafkaOverview}
      onClickKafkaOverview={onClickKafkaOverview}
      onClickQuickStart={onClickQuickStart}
      onCreate={handleCreate}
      onLearnHowToAddStreamingUnits={onClickKafkaOverview}
      onLearnMoreAboutSizes={onClickKafkaOverview}
      subscriptionOptionsHref={document.location.href + "/../overview"}
      appendTo={getModalAppendTo}
    />
  );
};

export { CreateInstance };
export default CreateInstance;
