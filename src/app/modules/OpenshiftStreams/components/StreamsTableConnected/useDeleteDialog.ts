import { KafkaInstancesProps } from "@rhoas/app-services-ui-components";
import { KafkaInstanceEnhanced } from "./useKafkaInstances";
import { useCallback } from "react";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";

export function useDeleteDialog() {
  const { showModal: showDeleteModal } =
    useModal<ModalType.KasDeleteInstance>();
  const openDeleteDialog: KafkaInstancesProps<KafkaInstanceEnhanced>["onDelete"] =
    useCallback(
      (instance, onDone) => {
        showDeleteModal(ModalType.KasDeleteInstance, {
          onDelete: onDone,
          kafka: instance.request,
        });
      },
      [showDeleteModal]
    );
  return {
    openDeleteDialog,
  };
}
