import { KafkaInstancesProps } from "@rhoas/app-services-ui-components";
import { KafkaInstanceEnhanced } from ".//useKafkaInstances";
import { useCallback } from "react";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";

export function useChangeOwnerDialog() {
  const { showModal: showTransferOwnershipModal } =
    useModal<ModalType.KasTransferOwnership>();

  const openChangeOwnerDialog: KafkaInstancesProps<KafkaInstanceEnhanced>["onChangeOwner"] =
    useCallback(
      (instance, onDone) => {
        showTransferOwnershipModal(ModalType.KasTransferOwnership, {
          kafka: instance.request,
          refreshKafkas: onDone,
        });
      },
      [showTransferOwnershipModal]
    );

  return { openChangeOwnerDialog };
}
