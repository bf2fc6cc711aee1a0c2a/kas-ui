import { FunctionComponent, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { parseISO } from "date-fns";
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
    const { bootstrap_server_host } = instance.request;
    return bootstrap_server_host?.endsWith(":443")
      ? bootstrap_server_host
      : `${bootstrap_server_host}:443`;
  };

  const getAdminServerUrl = () => {
    const { admin_api_server_url } = instance.request;
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
            createdAt={parseISO(instance.createdAt)}
            updatedAt={parseISO(instance.updatedAt)}
            expiryDate={
              instance.expiryDate ? parseISO(instance.expiryDate) : undefined
            }
            size={instance.size}
            ingress={instance.ingress}
            egress={instance.egress}
            storage={instance.storage}
            maxPartitions={instance.maxPartitions}
            connections={instance.connections}
            connectionRate={instance.connectionRate}
            messageSize={instance.messageSize}
            region={t(instance.region)}
            instanceType={instance.plan === "standard" ? "standard" : "eval"}
            billing={instance.billing}
            kafkaVersion={instance.request.version || ""}
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
