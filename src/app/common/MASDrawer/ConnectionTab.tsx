import React from 'react';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { ResourcesTab, ResourcesTabProps } from './ResourcesTab';
import { SampleCodeTab } from './SampleCodeTab';

export type ConnectionTabProps = ResourcesTabProps & {
  connectionTabProps?: {
    activeKey?: number | string;
    tabTitle1?: string;
    tabTitle2?: string;
  };
  handleConnectionTab?: (event: any, tabIndex: React.ReactText) => void;
};

export const ConnectionTab: React.FC<ConnectionTabProps> = ({
  connectionTabProps,
  handleConnectionTab,
  externalServer,
  instanceName,
  mainToggle,
}: ConnectionTabProps) => {
  const { activeKey, tabTitle1, tabTitle2 } = connectionTabProps || {};

  return (
    <div className="mas--details__drawer--tab-content pf-m-secondary">
      <Tabs activeKey={activeKey} isSecondary onSelect={handleConnectionTab}>
        <Tab eventKey={0} title={<TabTitleText>{tabTitle1}</TabTitleText>}>
          <ResourcesTab externalServer={externalServer} instanceName={instanceName} mainToggle={mainToggle} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{tabTitle2}</TabTitleText>}>
          <SampleCodeTab />
        </Tab>
      </Tabs>
    </div>
  );
};
