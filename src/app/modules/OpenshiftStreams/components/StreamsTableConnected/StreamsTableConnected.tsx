// eslint-disable @typescript-eslint/no-unused-vars
import { FederatedProps } from "@app/contexts";
import "@app/modules/styles.css";
import {
  KafkaInstances,
  KafkaInstancesProps,
} from "@rhoas/app-services-ui-components";
import { useCallback, useContext, VoidFunctionComponent } from "react";
import { KafkaInstanceEnhanced, useKafkaInstances } from "./useKafkaInstances";
import { useInstanceDrawer } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { useCreateDialog } from "./useCreateDialog";
import { useDeleteDialog } from "./useDeleteDialog";
import { useChangeOwnerDialog } from "./useChangeOwnerDialog";
import { useKafkaStatusAlerts } from "./useKafkaStatusAlerts";
import { QuickStartContext } from "@patternfly/quickstarts";
import { InstanceStatus } from "@app/utils";

export type StreamsTableProps = Pick<FederatedProps, "preCreateInstance"> & {
  currentUser: string | undefined;
  isCurrentUserOrgAdmin: boolean;
};

export const StreamsTableConnected: VoidFunctionComponent<
  StreamsTableProps
> = ({
  preCreateInstance,
  currentUser,
  isCurrentUserOrgAdmin,
}: StreamsTableProps) => {
  const fetchInstances = useKafkaInstances();
  const { openCreateModal } = useCreateDialog(preCreateInstance);
  const { openDeleteDialog } = useDeleteDialog();
  const { openChangeOwnerDialog } = useChangeOwnerDialog();
  const notifyForInstanceChange = useKafkaStatusAlerts();
  const { setActiveQuickStart } = useContext(QuickStartContext);

  const {
    isDrawerOpen,
    drawerInstance,
    closeDrawer,
    openDrawer,
    setDrawerActiveTab,
    setDrawerInstance,
  } = useInstanceDrawer();

  /*
          Fetch the latest instances for the user specified query, and checks the
          returned instances.
      
          If we have the drawer open but the data doesn't
          contain the instance anymore (eg. the instance got removed by someone else)
          we close the drawer. If we have the drawer open and we found the relative
          instance, we update the object the drawer uses to render the drawer to be
          sure it's referring to the latest data (needed for the connection info).
      
          This triggers also the notifications for ready/deleted instances.
         */
  const getInstances: KafkaInstancesProps<KafkaInstanceEnhanced>["getInstances"] =
    useCallback(
      async (...args) => {
        const res = await fetchInstances(...args);
        if (drawerInstance) {
          const latestDrawerInstanceData = res.instances.find(
            (i) => i.id === drawerInstance.id
          );
          if (!latestDrawerInstanceData) {
            closeDrawer();
          } else {
            /* we have to check if there is actually some difference between
                  the previous data and the current one to avoid render loops */
            if (
              JSON.stringify(latestDrawerInstanceData) !==
              JSON.stringify(drawerInstance)
            ) {
              setDrawerInstance(latestDrawerInstanceData);
            }
          }
        }
        notifyForInstanceChange(
          res.instances.filter((i) => i.owner == currentUser)
        );
        return res;
      },
      [
        closeDrawer,
        currentUser,
        drawerInstance,
        fetchInstances,
        notifyForInstanceChange,
        setDrawerInstance,
      ]
    );

  const onViewInstance = (instance: KafkaInstanceEnhanced) => {
    setDrawerInstance(instance);
    setDrawerActiveTab(InstanceDrawerTab.DETAILS);
    openDrawer();
  };

  const onViewConnection = (instance: KafkaInstanceEnhanced) => {
    setDrawerInstance(instance);
    setDrawerActiveTab(InstanceDrawerTab.CONNECTION);
    openDrawer();
  };

  const isUserOwnerOrAdmin = useCallback(
    ({ owner }: KafkaInstanceEnhanced) =>
      owner === currentUser || isCurrentUserOrgAdmin,
    [currentUser, isCurrentUserOrgAdmin]
  );

  const canChangeOwner = useCallback(
    ({ owner, status }: KafkaInstanceEnhanced) =>
      owner === currentUser ||
      (isCurrentUserOrgAdmin && status !== InstanceStatus.SUSPENDED),
    [currentUser, isCurrentUserOrgAdmin]
  );

  const onQuickstartGuide = useCallback(
    () => setActiveQuickStart && setActiveQuickStart("getting-started"),
    [setActiveQuickStart]
  );

  const onClickSupportLink = () => {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    (window as unknown as any).insights.chrome.createCase();
  };

  const canHaveInstanceLink = (KafkaInstance: KafkaInstanceEnhanced) => {
    return KafkaInstance.status !== InstanceStatus.READY;
  };

  const canOpenConnection = (KafkaInstance: KafkaInstanceEnhanced) => {
    return KafkaInstance.status !== InstanceStatus.SUSPENDED;
  };

  return (
    <KafkaInstances
      isRowSelected={({ row }) => isDrawerOpen && row.id === drawerInstance?.id}
      getInstances={getInstances}
      getUrlForInstance={({ id }) => `./kafkas/${id}/dashboard`}
      onCreate={openCreateModal}
      onDetails={onViewInstance}
      onConnection={onViewConnection}
      onChangeOwner={openChangeOwnerDialog}
      onDelete={openDeleteDialog}
      onClickConnectionTabLink={onViewConnection}
      onClickSupportLink={onClickSupportLink}
      onInstanceLinkClick={closeDrawer}
      onQuickstartGuide={onQuickstartGuide}
      canChangeOwner={canChangeOwner}
      canDelete={isUserOwnerOrAdmin}
      canHaveInstanceLink={canHaveInstanceLink}
      canOpenConnection={canOpenConnection}
    />
  );
};
