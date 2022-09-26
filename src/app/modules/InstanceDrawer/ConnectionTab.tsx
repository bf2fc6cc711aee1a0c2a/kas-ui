import { FC } from "react";
import {
  useBasename,
  ModalType,
  useModal,
} from "@rhoas/app-services-ui-shared";
import { KafkaConnectionTabP2 } from "@rhoas/app-services-ui-components";

export type ConnectionTabProps = {
  externalServer?: string;
  isKafkaPending?: boolean;
  tokenEndPointUrl: string;
  instanceId: string | undefined;
  adminServerUrl: string | undefined;
};

export const ConnectionTab: FC<ConnectionTabProps> = ({
  externalServer,
  isKafkaPending,
  tokenEndPointUrl,
  instanceId,
  adminServerUrl,
}: ConnectionTabProps) => {
  const { showModal } = useModal<ModalType.KasCreateServiceAccount>();

  const handleCreateServiceAccountModal = () => {
    showModal(ModalType.KasCreateServiceAccount, {});
  };
  const { getBasename } = useBasename() || {};
  const basename = getBasename && getBasename();

  return (
    <KafkaConnectionTabP2
      isKafkaPending={isKafkaPending}
      externalServer={externalServer}
      tokenEndPointUrl={tokenEndPointUrl}
      linkToServiceAccount={"service-accounts"}
      linkToAccessTab={`${basename}/${instanceId}/acls`}
      adminAPIUrl={adminServerUrl}
      showCreateServiceAccountModal={handleCreateServiceAccountModal}
      kafkaFleetManagerUrl={
        "https://api.openshift.com/api/kafkas_mgmt/v1/openapi"
      }
    />
  );
};

export default ConnectionTab;
