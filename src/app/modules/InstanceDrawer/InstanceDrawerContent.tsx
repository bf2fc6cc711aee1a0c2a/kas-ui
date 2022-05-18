import {
  FunctionComponent,
  lazy,
  Suspense,
  useState,
  useCallback,
  useEffect,
  memo,
} from "react";
import { useTranslation } from "react-i18next";
import { addHours } from "date-fns";
import { InstanceStatus } from "@app/utils";
import { MASLoading } from "@app/common";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core";
import { ConnectionTabProps } from "@app/modules/InstanceDrawer/ConnectionTab";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { KafkaDetailsTab } from "@rhoas/app-services-ui-components";
import { useGetAvailableSizes } from "@app/modules/OpenshiftStreams/dialogs/CreateInstance/CreateInstanceWithSizes/hooks";
import { Size } from "@rhoas/app-services-ui-components/types/src/Kafka/CreateKafkaInstanceWithSizes/types";

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
>;

const InstanceDrawerContent: FunctionComponent<InstanceDrawerContentProps> = ({
  tokenEndPointUrl,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  //states
  const [kafkaSize, setKafkaSize] = useState<Size | undefined>();
  const [isLoadingSize, setIsLoadingSize] = useState<boolean>(false);

  const getKafkaSizes = useGetAvailableSizes();

  const { instanceDrawerTab, setInstanceDrawerTab, instanceDrawerInstance } =
    useInstanceDrawer();
  const {
    id: kafkaId = "",
    owner = "",
    created_at = "",
    updated_at = "",
    region = "",
    instance_type: instanceType,
    cloud_provider: provider,
    size_id: sizeId,
  } = instanceDrawerInstance || {};

  const fetchAvailableSizes = useCallback(async () => {
    if (provider && region && instanceType) {
      try {
        setIsLoadingSize(true);

        const kafkaSizes = await getKafkaSizes(provider, region);

        const size =
          instanceType === "standar"
            ? kafkaSizes.standard?.find((s) => s.id === sizeId)
            : kafkaSizes?.trial;

        setKafkaSize(size);
        setIsLoadingSize(false);
      } catch (error) {
        setIsLoadingSize(false);
      }
    }
  }, [provider, region, instanceType, sizeId, getKafkaSizes]);

  useEffect(() => {
    fetchAvailableSizes();
  }, [kafkaId, fetchAvailableSizes]);

  const {
    ingress = 0,
    egress = 0,
    storage = 0,
    connectionRate = 0,
    maxPartitions = 0,
    connections = 0,
    displayName,
  } = kafkaSize || {};

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
            id={kafkaId}
            owner={owner}
            createdAt={new Date(created_at)}
            updatedAt={new Date(updated_at)}
            expiryDate={addHours(new Date(created_at), 48)}
            size={displayName}
            ingress={ingress}
            egress={egress}
            storage={storage}
            maxPartitions={maxPartitions}
            connections={connections}
            connectionRate={connectionRate}
            messageSize={1}
            region={t(region)}
            instanceType={instanceType === "standard" ? "standard" : "eval"}
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

const InstanceDrawerContentMemo = memo(InstanceDrawerContent);

export { InstanceDrawerContentMemo as InstanceDrawerContent };
