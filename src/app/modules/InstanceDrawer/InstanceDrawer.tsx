import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { InstanceDrawerContent } from "@app/modules/InstanceDrawer/InstanceDrawerContent";

import "./InstanceDrawer.css";
import { MASDrawer } from "@app/common";
import { InstanceDrawerTab } from "@app/modules/InstanceDrawer/tabs";
import { InstanceDrawerContextProps } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";

export type InstanceDrawerProps = {
  "data-ouia-app-id": string;
} & InstanceDrawerContextProps;

export const InstanceDrawer: FunctionComponent<InstanceDrawerProps> = ({
  "data-ouia-app-id": dataOuiaAppId,
  isDrawerOpen,
  drawerInstance,
  setDrawerActiveTab,
  drawerActiveTab,
  closeDrawer,
  tokenEndPointUrl,
  children,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);

  return (
    <MASDrawer
      isExpanded={isDrawerOpen}
      isLoading={drawerInstance === undefined}
      onClose={closeDrawer}
      panelBodyContent={
        drawerInstance && (
          <InstanceDrawerContent
            tokenEndPointUrl={tokenEndPointUrl}
            activeTab={drawerActiveTab || InstanceDrawerTab.DETAILS}
            instance={drawerInstance}
            setActiveTab={setDrawerActiveTab}
          />
        )
      }
      drawerHeaderProps={{
        text: { label: t("instance_name") },
        title: { value: drawerInstance?.name, headingLevel: "h1" },
      }}
      data-ouia-app-id={dataOuiaAppId}
      notRequiredDrawerContentBackground={drawerInstance === undefined}
    >
      {children}
    </MASDrawer>
  );
};
