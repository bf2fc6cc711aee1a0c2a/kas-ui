import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { MASDrawer, MASDrawerProps } from '@app/common';
import { ResourcesTab } from './ResourcesTab';
import { SampleCodeTab } from './SampleCodeTab';

export type ServiceRegistryDrawerProps = Omit<
  MASDrawerProps,
  'drawerHeaderProps' | 'panelBodyContent' | '[data-ouia-app-id]'
> & {
  activeTab?: React.ReactText;
};

const ServiceRegistryDrawer: React.FC<ServiceRegistryDrawerProps> = ({
  isExpanded,
  isLoading,
  onClose,
  'data-ouia-app-id': dataOuiaAppId,
  children,
  notRequiredDrawerContentBackground,
}: ServiceRegistryDrawerProps) => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<React.ReactText>(0);

  const handleTabClick = (_, eventKey: React.ReactText) => {
    setActiveKey(eventKey);
  };

  const panelBodyContent = (
    <Tabs activeKey={activeKey} onSelect={handleTabClick}>
      <Tab
        eventKey={0}
        title={<TabTitleText>{t('common.resources')}</TabTitleText>}
        data-testid="serviceRegustry-tabResources"
      >
        <ResourcesTab />
      </Tab>
      <Tab
        eventKey={1}
        title={<TabTitleText>{t('common.sample_code')}</TabTitleText>}
        data-testid="serviceRegistry-tabSampleCode"
      >
        <SampleCodeTab />
      </Tab>
    </Tabs>
  );

  return (
    <MASDrawer
      isExpanded={isExpanded}
      isLoading={isLoading}
      onClose={onClose}
      panelBodyContent={panelBodyContent}
      drawerHeaderProps={{
        text: { label: t('serviceRegistry.connection_details') },
        title: { value: 'TODO', headingLevel: 'h1' },
      }}
      data-ouia-app-id={dataOuiaAppId}
      notRequiredDrawerContentBackground={notRequiredDrawerContentBackground}
    >
      {children}
    </MASDrawer>
  );
};

export { ServiceRegistryDrawer };
