import React from 'react';
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
} from '@patternfly/react-core';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import { MASLoading } from '@app/common';
import './MASDrawer.css';

export type MASDrawerProps = DrawerProps & {
  children: React.ReactNode;
  panelBodyContent?: React.ReactNode;
  onClose: () => void;
  drawerData?: any;
  isLoading: boolean;
  drawerPanelContentProps?: Omit<DrawerPanelContentProps, 'children'>;
  drawerHeaderProps: {
    text: Omit<TextProps, 'children' | 'ref'> & {
      label: string | undefined;
    };
    title: Omit<TitleProps, 'children'> & {
      value: string | undefined;
    };
  };
};

export const MASDrawer: React.FC<MASDrawerProps> = ({
  onClose,
  isLoading = true,
  drawerPanelContentProps,
  drawerHeaderProps,
  isExpanded,
  children,
  panelBodyContent,
  onExpand,
}: MASDrawerProps) => {
  const { hidden = false, widths, ...restDrawerPanelContentProps } = drawerPanelContentProps || {};
  const { text, title } = drawerHeaderProps || {};

  const panelContent = () => {
    return (
      <DrawerPanelContent widths={widths || { default: 'width_50' }} hidden={hidden} {...restDrawerPanelContentProps}>
        {isLoading ? (
          <MASLoading />
        ) : (
          <>
            <DrawerHead>
              <TextContent>
                <Text component={text?.component || TextVariants.small} className={text?.className || 'pf-u-mb-0'}>
                  {text?.label}
                </Text>
                <Title
                  headingLevel={title?.headingLevel}
                  size={title?.size || TitleSizes['xl']}
                  className={title?.className || 'pf-u-mt-0'}
                >
                  {title?.value}
                </Title>
              </TextContent>
              <DrawerActions>
                <DrawerCloseButton onClick={onClose} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>{panelBodyContent}</DrawerPanelBody>
          </>
        )}
      </DrawerPanelContent>
    );
  };

  return (
    <Drawer isExpanded={isExpanded} onExpand={onExpand}>
      <DrawerContent panelContent={panelContent()}>{children}</DrawerContent>
    </Drawer>
  );
};
