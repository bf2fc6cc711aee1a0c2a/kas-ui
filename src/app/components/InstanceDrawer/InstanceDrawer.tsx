import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { MASDrawer, MASDrawerProps } from '@app/common';
import { ConnectionTab } from './ConnectionTab';
import { DetailsTab, DetailsTabProps } from './DetailsTab';

export type InstanceDrawerProps = Omit<MASDrawerProps, 'drawerHeaderProps' | 'panelBodyContent'> &
  DetailsTabProps & {
    activeTab?: string;
  };
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  mainToggle,
  onClose,
  activeTab,
  instanceDetail,
  isExpanded,
  isLoading,
  children,
}) => {
  dayjs.extend(localizedFormat);

  const { t } = useTranslation();
  const { name } = instanceDetail || {};

  const [activeTab1Key, setActiveTab1Key] = useState<string | number>(0);
  const [activeTab2Key, setActiveTab2Key] = useState<string | number>(0);

  useEffect(() => {
    const selectedTab = activeTab?.toLowerCase() === 'details' ? 0 : 1;
    setActiveTab1Key(selectedTab);
  }, [activeTab]);

  const handleTab1Click = (_, eventKey: string | number) => {
    setActiveTab1Key(eventKey);
  };

  const onSelectConnectionTab = (_, eventKey: string | number) => {
    setActiveTab2Key(eventKey);
  };

  const getExternalServer = () => {
    const { bootstrapServerHost } = instanceDetail || {};
    return bootstrapServerHost?.endsWith(':443') ? bootstrapServerHost : `${bootstrapServerHost}:443`;
  };

  const panelBodyContent = () => {
    return (
      <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
        <Tab eventKey={0} title={<TabTitleText>{t('details')}</TabTitleText>}>
          <DetailsTab mainToggle={mainToggle} instanceDetail={instanceDetail} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('connection')}</TabTitleText>}>
          <ConnectionTab
            mainToggle={mainToggle}
            activeKey={activeTab2Key}
            instanceName={name}
            externalServer={getExternalServer()}
            onSelect={onSelectConnectionTab}
          />
        </Tab>
      </Tabs>
    );
  };

  return (
    <MASDrawer
      isExpanded={isExpanded}
      isLoading={isLoading}
      onClose={onClose}
      panelBodyContent={panelBodyContent()}
      drawerHeaderProps={{
        text: { label: t('instance_name') },
        title: { value: name, headingLevel: 'h1' },
      }}
    >
      {children}
    </MASDrawer>
  );
};

export { InstanceDrawer };
