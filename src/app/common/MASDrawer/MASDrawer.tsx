import { ReactNode, FC } from "react";
import {
  Drawer,
  DrawerProps,
  DrawerContent,
  DrawerPanelContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerActions,
  DrawerCloseButton,
  TextContent,
  Text,
  TextVariants,
  Title,
  TitleSizes,
  DrawerPanelContentProps,
  TextProps,
  TitleProps,
  DrawerContentBody,
} from "@patternfly/react-core";
import { MASLoading } from "@app/common";
import "./MASDrawer.css";

export type MASDrawerProps = DrawerProps & {
  children: ReactNode;
  panelBodyContent?: ReactNode;
  onClose: () => void;
  drawerData?: unknown;
  isLoading?: boolean;
  drawerPanelContentProps?: Omit<DrawerPanelContentProps, "children">;
  drawerHeaderProps?: {
    text?: Omit<TextProps, "children" | "ref"> & {
      label: string | undefined;
    };
    title?: Omit<TitleProps, "children"> & {
      value: string | undefined;
    };
  };
  ["data-ouia-app-id"]?: string;
  notRequiredDrawerContentBackground?: boolean | undefined;
  inlineAlertMessage?: ReactNode;
};

export const MASDrawer: FC<MASDrawerProps> = ({
  onClose,
  isLoading = true,
  drawerPanelContentProps,
  drawerHeaderProps,
  isExpanded,
  children,
  panelBodyContent,
  onExpand,
  notRequiredDrawerContentBackground,
  "data-ouia-app-id": dataOuiaAppId,
  inlineAlertMessage,
}: MASDrawerProps) => {
  const { widths, ...restDrawerPanelContentProps } =
    drawerPanelContentProps || {};
  const { text, title } = drawerHeaderProps || {};

  const panelContent = (
    <DrawerPanelContent
      widths={widths || { default: "width_50" }}
      {...restDrawerPanelContentProps}
    >
      {isLoading ? (
        <MASLoading />
      ) : (
        <>
          <DrawerHead>
            <TextContent>
              {text?.label && (
                <Text
                  component={text?.component || TextVariants.small}
                  className={text?.className || "pf-u-mb-0"}
                >
                  {text?.label}
                </Text>
              )}
              {title?.value && (
                <Title
                  headingLevel={title?.headingLevel || "h2"}
                  size={title?.size || TitleSizes["xl"]}
                  className={title?.className || "pf-u-mt-0"}
                >
                  {title?.value}
                </Title>
              )}
            </TextContent>
            <DrawerActions>
              <DrawerCloseButton onClick={onClose} />
            </DrawerActions>
          </DrawerHead>
          <DrawerPanelBody>
            {inlineAlertMessage}
            {panelBodyContent}
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );

  return (
    <Drawer
      isExpanded={isExpanded}
      onExpand={onExpand}
      data-ouia-app-id={dataOuiaAppId}
      data-testid="mk--instance__drawer"
      className="kas-drawer"
    >
      <DrawerContent
        panelContent={panelContent}
        className={
          notRequiredDrawerContentBackground ? "pf-m-no-background" : ""
        }
      >
        <DrawerContentBody className="pf-u-display-flex pf-u-flex-direction-column">
          {" "}
          {children}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default MASDrawer;
