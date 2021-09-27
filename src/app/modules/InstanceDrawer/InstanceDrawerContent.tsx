import { DetailsTabProps } from '@app/modules/InstanceDrawer/DetailsTab';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/utils';
import { MASLoading } from '@app/common';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ConnectionTabProps } from '@app/modules/InstanceDrawer/ConnectionTab';

export const ResourcesTab = React.lazy(() => import('./ConnectionTab'));
export const DetailsTab = React.lazy(() => import('./DetailsTab'));

export enum InstanceDrawerTabs {
  DETAILS = 'details',
  CONNECTION = 'connection',
}

export type InstanceDrawerContentProps = DetailsTabProps &
  Pick<ConnectionTabProps, 'tokenEndPointUrl'> & {
    initialTab?: InstanceDrawerTabs;
  };

export const InstanceDrawerContent: React.FunctionComponent<InstanceDrawerContentProps> =
  ({ initialTab, instanceDetail, tokenEndPointUrl }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<InstanceDrawerTabs>(
      initialTab || InstanceDrawerTabs.DETAILS
    );

    const selectTab = (tab: string | number) => {
      if (tab === InstanceDrawerTabs.CONNECTION) {
        setActiveTab(InstanceDrawerTabs.CONNECTION);
      } else {
        setActiveTab(InstanceDrawerTabs.DETAILS);
      }
    };

    const getExternalServer = () => {
      const { bootstrap_server_host } = instanceDetail || {};
      return bootstrap_server_host?.endsWith(':443')
        ? bootstrap_server_host
        : `${bootstrap_server_host}:443`;
    };

    const isKafkaPending =
      instanceDetail?.status === InstanceStatus.ACCEPTED ||
      instanceDetail?.status === InstanceStatus.PREPARING;

    return (
      <React.Suspense fallback={<MASLoading />}>
        <Tabs
          activeKey={activeTab.toString()}
          onSelect={(_, tab) => selectTab(tab)}
        >
          <Tab
            eventKey={InstanceDrawerTabs.DETAILS.toString()}
            title={<TabTitleText>{t('details')}</TabTitleText>}
          >
            <DetailsTab instanceDetail={instanceDetail} />
          </Tab>
          <Tab
            eventKey={InstanceDrawerTabs.CONNECTION.toString()}
            title={<TabTitleText>{t('connection')}</TabTitleText>}
            data-testid='drawerStreams-tabConnect'
          >
            <ResourcesTab
              externalServer={getExternalServer()}
              isKafkaPending={isKafkaPending}
              tokenEndPointUrl={tokenEndPointUrl}
            />
          </Tab>
        </Tabs>
      </React.Suspense>
    );
  };
