import { KafkaInstancesProps } from "@rhoas/app-services-ui-components";
import { KafkaInstanceEnhanced } from "./useKafkaInstances";
import { useCallback } from "react";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";
import useChrome from "@redhat-cloud-services/frontend-components/useChrome";

export function useDeleteDialog() {
  const { analytics } = useChrome();
  const { showModal: showDeleteModal } =
    useModal<ModalType.KasDeleteInstance>();
  const openDeleteDialog: KafkaInstancesProps<KafkaInstanceEnhanced>["onDelete"] =
    useCallback(
      (instance, onDone) => {
        analytics.track("RHOSAK Delete Instance", {
          status: "prompt",
          entityId: instance.id,
        });
        showDeleteModal(ModalType.KasDeleteInstance, {
          onDelete: () => {
            analytics.track("RHOSAK Delete Instance", {
              status: "success",
              entityId: instance.id,
            });
            onDone();
          },
          kafka: instance.request,
        });
      },
      [analytics, showDeleteModal]
    );
  return {
    openDeleteDialog,
  };
}
