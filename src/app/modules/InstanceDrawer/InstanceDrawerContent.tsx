import { FunctionComponent, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { addHours } from "date-fns";
import { InstanceStatus } from "@app/utils";
import { MASLoading } from "@app/common";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { ConnectionTabProps } from "@app/modules/InstanceDrawer/ConnectionTab";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { KafkaDetailsTab } from "@rhoas/app-services-ui-components";

export const ResourcesTab = lazy(() => import("./ConnectionTab"));

export type InstanceDrawerContentProps = Pick<
  ConnectionTabProps,
  "tokenEndPointUrl"
>;

export const InstanceDrawerContent: FunctionComponent<
  InstanceDrawerContentProps
> = ({ tokenEndPointUrl }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);

  const { instanceDrawerTab, setInstanceDrawerTab, instanceDrawerInstance } =
    useInstanceDrawer();
  const {
    id = "",
    owner = "",
    created_at = "",
    updated_at = "",
    egress_throughput_per_sec = "",
    ingress_throughput_per_sec = "",
    kafka_storage_size = "",
    max_connection_attempts_per_sec = 0,
    max_partitions = 0,
    total_max_connections = 0,
    size_id = "",
    region = "",
    instance_type = "",
  } = instanceDrawerInstance || {};

  const selectTab = (tab: string | number) => {
    if (tab === InstanceDrawerTab.CONNECTION) {
      setInstanceDrawerTab(InstanceDrawerTab.CONNECTION);
    } else {
      setInstanceDrawerTab(InstanceDrawerTab.DETAILS);
    }
  };

  const getExternalServer = () => {
    const { bootstrap_server_host } = instanceDrawerInstance || {};
    return bootstrap_server_host?.endsWith(":443")
      ? bootstrap_server_host
      : `${bootstrap_server_host}:443`;
  };

  const isKafkaPending =
    instanceDrawerInstance?.status === InstanceStatus.ACCEPTED ||
    instanceDrawerInstance?.status === InstanceStatus.PREPARING;

  return (
    <Suspense fallback={<MASLoading />}>
      <Tabs
        activeKey={instanceDrawerTab.toString()}
        onSelect={(_, tab) => selectTab(tab)}
      >
        <Tab
          eventKey={InstanceDrawerTab.DETAILS.toString()}
          title={<TabTitleText>{t("details")}</TabTitleText>}
        >
          <KafkaDetailsTab
            id={id}
            owner={owner}
            createdAt={new Date(created_at)}
            updatedAt={new Date(updated_at)}
            expiryDate={addHours(new Date(created_at), 48)}
            size={size_id}
            ingress={ingress_throughput_per_sec?.slice(
              0,
              ingress_throughput_per_sec?.length - 2
            )}
            egress={egress_throughput_per_sec?.slice(
              0,
              egress_throughput_per_sec?.length - 2
            )}
            storage={kafka_storage_size?.slice(
              0,
              kafka_storage_size?.length - 2
            )}
            maxPartitions={max_partitions}
            connections={total_max_connections}
            connectionRate={max_connection_attempts_per_sec}
            messageSize={1}
            region={t(region)}
            instanceType={instance_type === "standard" ? "standard" : "eval"}
          />
        </Tab>
        <Tab
          eventKey={InstanceDrawerTab.CONNECTION.toString()}
          title={<TabTitleText>{t("connection")}</TabTitleText>}
          data-testid="drawerStreams-tabConnect"
        >
          <ResourcesTab
            externalServer={getExternalServer()}
            isKafkaPending={isKafkaPending}
            tokenEndPointUrl={tokenEndPointUrl}
            instanceId={instanceDrawerInstance?.id}
          />
        </Tab>
      </Tabs>
    </Suspense>
  );
};
