import {
  ReactElement,
  useMemo,
  VoidFunctionComponent,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-restricted-imports
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "@patternfly/react-styles/css/utilities/Spacing/spacing.css";
import "@patternfly/react-styles/css/utilities/Alignment/alignment.css";
import { MASDrawer, MASDrawerProps } from "@app/common";
import "./InstanceDrawer.css";
import {
  InstanceDrawerContent,
  InstanceDrawerContentProps,
} from "@app/modules/InstanceDrawer/InstanceDrawerContent";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";
import { InstanceType } from "@app/utils";
import { useGetAvailableSizes } from "@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstanceWithSizes/hooks";
import { Size } from "@rhoas/app-services-ui-components/types/src/Kafka/CreateKafkaInstanceWithSizes/types";

export type InstanceDrawerProps = Omit<
  MASDrawerProps,
  | "drawerHeaderProps"
  | "panelBodyContent"
  | "[data-ouia-app-id]"
  | "isExpanded"
  | "isLoading"
  | "onClose"
  | "notRequiredDrawerContentBackground"
  | "children"
> &
  InstanceDrawerContentProps & {
    renderContent: (props: {
      openDrawer: () => void;
      closeDrawer: () => void;
      setInstance: (instance: KafkaRequest) => void;
    }) => ReactElement;
  };

const InstanceDrawer: VoidFunctionComponent<InstanceDrawerProps> = ({
  renderContent,
  "data-ouia-app-id": dataOuiaAppId,
  tokenEndPointUrl,
}) => {
  dayjs.extend(localizedFormat);
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  //states
  const [kafkaSize, setKafkaSize] = useState<Size | undefined>();
  const [isLoadingSize, setIsLoadingSize] = useState<boolean>(false);

  const getKafkaSizes = useGetAvailableSizes();

  const {
    isInstanceDrawerOpen,
    instanceDrawerInstance,
    openInstanceDrawer,
    closeInstanceDrawer,
    setInstanceDrawerInstance,
    noInstances,
  } = useInstanceDrawer();

  const {
    id: kafkaId,
    cloud_provider: provider,
    region,
    size_id,
    instance_type,
  } = instanceDrawerInstance || {};

  const fetchAvailableSizes = useCallback(async () => {
    if (provider && region && instance_type) {
      try {
        setIsLoadingSize(true);

        const kafkaSizes = await getKafkaSizes(
          provider,
          region,
          instance_type as InstanceType
        );

        const size = kafkaSizes.sizes?.find((s) => s.id === size_id);

        setKafkaSize(size);
        setIsLoadingSize(false);
      } catch (error) {
        setIsLoadingSize(false);
      }
    }
  }, [provider, region, instance_type, size_id, getKafkaSizes]);

  useEffect(() => {
    fetchAvailableSizes();
  }, [kafkaId, fetchAvailableSizes]);

  const content = useMemo(
    () =>
      renderContent({
        closeDrawer: closeInstanceDrawer,
        openDrawer: openInstanceDrawer,
        setInstance: setInstanceDrawerInstance,
      }),
    [
      closeInstanceDrawer,
      openInstanceDrawer,
      renderContent,
      setInstanceDrawerInstance,
    ]
  );

  const {
    displayName,
    maxPartitions = 0,
    ingress = 0,
    egress = 0,
    messageSize = 0,
    connections = 0,
    connectionRate = 0,
    storage = 0,
  } = kafkaSize || {};

  return (
    <MASDrawer
      isExpanded={isInstanceDrawerOpen}
      isLoading={instanceDrawerInstance === undefined}
      onClose={closeInstanceDrawer}
      panelBodyContent={
        <InstanceDrawerContent
          tokenEndPointUrl={tokenEndPointUrl}
          kafkaSize={{
            size: displayName,
            ingress,
            egress,
            storage,
            maxPartitions,
            connections,
            connectionRate,
            messageSize,
            isLoadingSize,
          }}
        />
      }
      drawerHeaderProps={{
        text: { label: t("instance_name") },
        title: { value: instanceDrawerInstance?.name, headingLevel: "h1" },
      }}
      data-ouia-app-id={dataOuiaAppId}
      notRequiredDrawerContentBackground={noInstances}
    >
      {content}
    </MASDrawer>
  );
};

export { InstanceDrawer };
