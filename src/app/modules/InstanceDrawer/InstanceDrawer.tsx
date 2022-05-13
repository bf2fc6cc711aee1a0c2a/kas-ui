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
import {
  KafkaRequest,
  Configuration,
  DefaultApi,
  SupportedKafkaSize,
} from "@rhoas/kafka-management-sdk";
import { useConfig, useAuth } from "@rhoas/app-services-ui-shared";
import { convertBytesToUnit } from "@app/utils";

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
  const [kafkaSize, setKafkaSize] = useState<SupportedKafkaSize | undefined>();
  const [isLoadingSize, setIsLoadingSize] = useState<boolean>(false);

  const {
    kas: { apiBasePath: basePath },
  } = useConfig();

  const {
    kas: { getToken },
  } = useAuth();

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
    const api = new DefaultApi(
      new Configuration({
        accessToken: getToken(),
        basePath,
      })
    );

    if (provider && region) {
      try {
        setIsLoadingSize(true);

        const sizes = await api.getInstanceTypesByCloudProviderAndRegion(
          provider,
          region
        );

        const instanceTypesSizes = sizes?.data?.instance_types?.find(
          (i) => i.id === instance_type
        )?.sizes;

        const size = instanceTypesSizes?.find((s) => s.id === size_id);

        setKafkaSize(size);
        setIsLoadingSize(false);
      } catch (error) {
        setIsLoadingSize(false);
      }
    }
  }, [provider, region, basePath, getToken, instance_type, size_id]);

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
    // display_name: size,
    //max_message_size
    id: sizeId,
    ingress_throughput_per_sec,
    egress_throughput_per_sec,
    max_partitions,
    max_connection_attempts_per_sec,
    total_max_connections,
    max_data_retention_size,
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
            size: sizeId,
            ingress: convertBytesToUnit(
              ingress_throughput_per_sec?.bytes || 0,
              "MiB"
            ),
            egress: convertBytesToUnit(
              egress_throughput_per_sec?.bytes || 0,
              "MiB"
            ),
            storage: convertBytesToUnit(
              max_data_retention_size?.bytes || 0,
              "GiB"
            ),
            maxPartitions: max_partitions || 0,
            connections: total_max_connections || 0,
            connectionRate: max_connection_attempts_per_sec || 0,
            messageSize: 1, //max_message_size
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
