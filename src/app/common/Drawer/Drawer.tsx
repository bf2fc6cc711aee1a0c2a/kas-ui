import React, { useEffect, useState } from 'react';
import {
  DrawerPanelContent,
  DrawerHead,
  DrawerPanelBody,
  DrawerActions,
  DrawerCloseButton,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
  TextVariants,
  Title,
  TitleSizes,
  DrawerPanelContentProps,
  TextProps,
  TitleProps,
} from '@patternfly/react-core';
import { Loading } from '@app/common';
import { DetailsTab, DetailsTabProps } from './DetailsTab';
import { ConnectionTab, ConnectionTabProps } from './ConnectionTab';
import './Drawer.css';

export type DrawerProps = DetailsTabProps &
  ConnectionTabProps & {
    mainToggle?: boolean;
    activeTab?: string;
    tabTitle1?: string;
    tabTitle2?: string;
    onClose: () => void;
    isExpanded?: boolean;
    drawerData?: any;
    isLoading: boolean;
    drawerPanelContentProps?: Omit<DrawerPanelContentProps, 'children'>;
    drawerHeaderProps?: {
      text?: Omit<TextProps, 'children' | 'ref'> & {
        label?: string;
      };
      title?: Omit<TitleProps, 'children' | 'headingLevel'> & {
        value?: string;
        headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      };
    };
  };

export const Drawer: React.FC<DrawerProps> = ({
  mainToggle,
  activeTab,
  onClose,
  isLoading = true,
  drawerPanelContentProps,
  drawerHeaderProps,
  detailsTabProps,
  connectionTabProps,
  tabTitle1,
  tabTitle2,
  instanceName,
  externalServer,
}: DrawerProps) => {
  const { hidden = false, widths, ...restDrawerPanelContentProps } = drawerPanelContentProps || {};
  const { text, title } = drawerHeaderProps || {};

  const [activeTab1Key, setActiveTab1Key] = useState(0);
  const [activeTab2Key, setActiveTab2Key] = useState(0);

  useEffect(() => {
    setActiveTab1Key(activeTab === tabTitle1 ? 0 : 1);
  }, [activeTab]);

  const handleTab1Click = (_, tabIndex) => {
    setActiveTab1Key(tabIndex);
  };

  const handleTab2Click = (_, tabIndex) => {
    setActiveTab2Key(tabIndex);
  };

  return (
    <DrawerPanelContent widths={widths || { default: 'width_50' }} hidden={hidden} {...restDrawerPanelContentProps}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <DrawerHead>
            <TextContent>
              <Text component={text?.component || TextVariants.small} className={text?.className || 'pf-u-mb-0'}>
                {text?.label}
              </Text>
              <Title
                headingLevel={title?.headingLevel || 'h1'}
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
          <DrawerPanelBody>
            <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
              <Tab eventKey={0} title={<TabTitleText>{tabTitle1}</TabTitleText>}>
                <DetailsTab mainToggle={mainToggle} detailsTabProps={detailsTabProps} />
              </Tab>
              <Tab eventKey={1} title={<TabTitleText>{tabTitle2}</TabTitleText>}>
                <ConnectionTab
                  connectionTabProps={{
                    activeKey: activeTab2Key,
                    ...connectionTabProps,
                  }}
                  mainToggle={mainToggle}
                  instanceName={instanceName}
                  externalServer={externalServer}
                  handleConnectionTab={handleTab2Click}
                />
              </Tab>
            </Tabs>
          </DrawerPanelBody>
        </>
      )}
    </DrawerPanelContent>
  );
};
