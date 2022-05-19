import { VoidFunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from "@patternfly/react-core";
import { format, parseISO } from "date-fns";
import { InstanceDrawerContextProps } from "@app/modules/InstanceDrawer/contexts/InstanceDrawerContext";

export const DetailsTab: VoidFunctionComponent<
  Pick<InstanceDrawerContextProps, "drawerInstance">
> = ({ drawerInstance }) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const { id, owner, created_at, updated_at } = drawerInstance || {};

  const renderTextListItem = (title: string, value?: string) =>
    value && (
      <>
        <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
      </>
    );

  return (
    <div className="mas--details__drawer--tab-content">
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {renderTextListItem(t("cloud_provider"), t("amazon_web_services"))}
          {renderTextListItem(t("region"), t(drawerInstance?.region || ""))}
          {renderTextListItem(t("id"), id)}
          {renderTextListItem(t("owner"), owner)}
          {renderTextListItem(
            t("created"),
            created_at ? format(parseISO(created_at), "LLLL") : "-"
          )}
          {renderTextListItem(
            t("updated"),
            updated_at ? format(parseISO(updated_at), "LLLL") : "-"
          )}
        </TextList>
      </TextContent>
    </div>
  );
};

export default DetailsTab;
