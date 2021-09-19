import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsProps, Tab, TabTitleText } from '@patternfly/react-core';
import { ResourcesTab, ResourcesTabProps } from './ResourcesTab';
import { SampleCodeTab } from './SampleCodeTab';

export type ConnectionTabProps = Pick<TabsProps, 'onSelect' | 'activeKey'> &
  ResourcesTabProps;

export const ConnectionTab: React.FC<ConnectionTabProps> = ({
  onSelect,
  externalServer,
  instance,
  mainToggle,
  activeKey,
  isKafkaPending,
  tokenEndPointUrl,
}: ConnectionTabProps) => {
  const { t } = useTranslation();

  return mainToggle ? (
    <div className='mas--details__drawer--tab-content pf-m-secondary'>
      <Tabs activeKey={activeKey} isSecondary onSelect={onSelect}>
        <Tab eventKey={0} title={<TabTitleText>{t('resources')}</TabTitleText>}>
          <ResourcesTab
            externalServer={externalServer}
            instance={instance}
            mainToggle={mainToggle}
            isKafkaPending={isKafkaPending}
            tokenEndPointUrl={tokenEndPointUrl}
          />
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>{t('sample_code')}</TabTitleText>}
        >
          <SampleCodeTab />
        </Tab>
      </Tabs>
    </div>
  ) : (
    <ResourcesTab
      externalServer={externalServer}
      instance={instance}
      mainToggle={mainToggle}
      isKafkaPending={isKafkaPending}
      tokenEndPointUrl={tokenEndPointUrl}
    />
  );
};

export default ConnectionTab;
