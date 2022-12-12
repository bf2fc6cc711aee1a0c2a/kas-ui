import {
  KafkaInstancesProps,
  useURLSearchParams,
} from "@rhoas/app-services-ui-components";
import { useCallback, useEffect } from "react";
import { FederatedProps, useFederated } from "@app/contexts";
import { ModalType, useModal } from "@rhoas/app-services-ui-shared";
import { KafkaInstanceEnhanced } from "./useKafkaInstances";
import useChrome from "@redhat-cloud-services/frontend-components/useChrome";

export function useCreateDialog(
  preCreateInstance: FederatedProps["preCreateInstance"] = () =>
    Promise.resolve(true)
) {
  const { analytics } = useChrome();
  const { shouldOpenCreateModal } = useFederated();
  const { showModal: showCreateModal } =
    useModal<ModalType.KasCreateInstance>();
  const { update, query } = useURLSearchParams();

  const openCreateModal: KafkaInstancesProps<KafkaInstanceEnhanced>["onCreate"] =
    useCallback(
      async (onDone) => {
        analytics.track("RHOSAK Create Instance", { status: "prompt" });
        // Callback before opening create dialog
        // The callback can override the new state of opening
        if (await preCreateInstance(true)) {
          showCreateModal(ModalType.KasCreateInstance, {
            onCreate: () => {
              analytics.track("RHOSAK Create Instance", {
                status: "success",
              });
              onDone();
            },
          });
        } else {
          analytics.track("RHOSAK Create Instance", {
            status: "failure-tos-refused",
          });
        }
      },
      [analytics, preCreateInstance, showCreateModal]
    );

  /*
    Checks for the ?create=true parameter in the url

    If found, it does the pre create instance checks (the Terms & Conditions
    check) then opens the modal. The parameter gets removed from the url to
    avoid loops and to make refreshing the page a safe action (the modal will
    not be opened again)
   */
  useEffect(() => {
    async function checkForCreateModal() {
      if (await shouldOpenCreateModal()) {
        query.delete("create");
        update(query);
        if (await preCreateInstance(true)) {
          showCreateModal(ModalType.KasCreateInstance, {
            onCreate: () => {
              /* do nothing */
            },
          });
        }
      }
    }
    void checkForCreateModal();
  }, [
    openCreateModal,
    preCreateInstance,
    query,
    shouldOpenCreateModal,
    showCreateModal,
    update,
  ]);

  return {
    openCreateModal,
  };
}
