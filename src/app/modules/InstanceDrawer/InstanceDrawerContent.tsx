import { FunctionComponent, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { addHours, parseISO } from "date-fns";
import { InstanceStatus } from "@app/utils";
import { MASLoading } from "@app/common";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { KafkaDetailsTab } from "@rhoas/app-services-ui-components";
import { InstanceDrawerContextProps } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";

export const ResourcesTab = lazy(() => import("./ConnectionTab"));

export type InstanceDrawerContentProps = {
  instance: NonNullable<InstanceDrawerContextProps["drawerInstance"]>;
  activeTab: InstanceDrawerTab;
  setActiveTab: (tab: InstanceDrawerTab) => void;
  tokenEndPointUrl: string;
};

export const InstanceDrawerContent: FunctionComponent<
  InstanceDrawerContentProps
> = ({ instance, activeTab, setActiveTab, tokenEndPointUrl }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);

  const getExternalServer = () => {
    const { bootstrap_server_host } = instance;
    return bootstrap_server_host?.endsWith(":443")
      ? bootstrap_server_host
      : `${bootstrap_server_host}:443`;
  };

  const getAdminServerUrl = () => {
    const { admin_api_server_url } = instance;
    return admin_api_server_url ? `${admin_api_server_url}/openapi` : undefined;
  };

  const isKafkaPending =
    instance.status === InstanceStatus.ACCEPTED ||
    instance.status === InstanceStatus.PREPARING;

  return (
    <Suspense fallback={<MASLoading />}>
      <Tabs
        activeKey={activeTab}
        onSelect={(_, tab) => setActiveTab(tab as InstanceDrawerTab)}
      >
        <Tab
          eventKey={InstanceDrawerTab.DETAILS}
          title={<TabTitleText>{t("details")}</TabTitleText>}
        >
          <KafkaDetailsTab
            id={instance.id}
            owner={instance.owner}
            createdAt={parseISO(instance.created_at)}
            updatedAt={parseISO(instance.updated_at)}
            expiryDate={addHours(parseISO(instance.created_at), 48)}
            size={instance.size.display_name}
            ingress={
              (instance.size.ingress_throughput_per_sec.bytes || 0) / 1048576
            }
            egress={
              (instance.size.egress_throughput_per_sec.bytes || 0) / 1048576
            }
            storage={Math.round(
              (instance.size.max_data_retention_size.bytes || 0) / 1073741824
            )}
            maxPartitions={instance.size.max_partitions}
            connections={instance.size.total_max_connections}
            connectionRate={instance.size.max_connection_attempts_per_sec}
            messageSize={(instance.size.max_message_size.bytes || 0) / 1048576}
            region={t(instance.region)}
            instanceType={
              instance.instance_type === "standard" ? "standard" : "eval"
            }
            isLoadingSize={false}
          />
        </Tab>
        <Tab
          eventKey={InstanceDrawerTab.CONNECTION.toString()}
          title={<TabTitleText>{t("connection")}</TabTitleText>}
          data-testid="drawerStreams-tabConnect"
        >
          <ResourcesTab
            externalServer={getExternalServer()}
            adminServerUrl={getAdminServerUrl()}
            isKafkaPending={isKafkaPending}
            tokenEndPointUrl={tokenEndPointUrl}
            instanceId={instance.id}
          />
        </Tab>
      </Tabs>
    </Suspense>
  );
};
