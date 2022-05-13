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

export type KafkaDetailsTabProps = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date;
  owner: string;
};

export type KafkaSize = {
  size?: string;
  ingress: number;
  egress: number;
  storage: number;
  maxPartitions: number;
  connections: number;
  connectionRate: number;
  messageSize: number;
  isLoadingSize: boolean;
};

export const ResourcesTab = lazy(() => import("./ConnectionTab"));

export type InstanceDrawerContentProps = Pick<
  ConnectionTabProps,
  "tokenEndPointUrl"
> & {
  kafkaSize?: KafkaSize;
};

export const InstanceDrawerContent: FunctionComponent<
  InstanceDrawerContentProps
> = ({ tokenEndPointUrl, kafkaSize }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const {
    ingress = 0,
    egress = 0,
    storage = 0,
    connectionRate = 0,
    maxPartitions = 0,
    connections = 0,
    size,
    isLoadingSize = false,
  } = kafkaSize || {};

  const { instanceDrawerTab, setInstanceDrawerTab, instanceDrawerInstance } =
    useInstanceDrawer();
  const {
    id = "",
    owner = "",
    created_at = "",
    updated_at = "",
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
            size={size}
            ingress={ingress}
            egress={egress}
            storage={storage}
            maxPartitions={maxPartitions}
            connections={connections}
            connectionRate={connectionRate}
            messageSize={1}
            region={t(region)}
            instanceType={instance_type === "standard" ? "standard" : "eval"}
            isLoadingSize={isLoadingSize}
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
