import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InstanceStatus } from '@app/utils';
import { MASLoading } from '@app/common';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ConnectionTabProps } from '@app/modules/InstanceDrawer/ConnectionTab';
import { useInstanceDrawer } from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';
import { InstanceDrawerTab } from '@app/modules/InstanceDrawer/tabs';

export const ResourcesTab = React.lazy(() => import('./ConnectionTab'));
export const DetailsTab = React.lazy(() => import('./DetailsTab'));

export type InstanceDrawerContentProps = Pick<
  ConnectionTabProps,
  'tokenEndPointUrl'
>;

export const InstanceDrawerContent: React.FunctionComponent<InstanceDrawerContentProps> =
  ({ tokenEndPointUrl }) => {
    const { t } = useTranslation(['kasTemporaryFixMe']);

    const { instanceDrawerTab, setInstanceDrawerTab, instanceDrawerInstance } =
      useInstanceDrawer();

    const selectTab = (tab: string | number) => {
      if (tab === InstanceDrawerTab.CONNECTION) {
        setInstanceDrawerTab(InstanceDrawerTab.CONNECTION);
      } else {
        setInstanceDrawerTab(InstanceDrawerTab.DETAILS);
      }
    };

    const getExternalServer = () => {
      const { bootstrap_server_host } = instanceDrawerInstance || {};
      return bootstrap_server_host?.endsWith(':443')
        ? bootstrap_server_host
        : `${bootstrap_server_host}:443`;
    };

    const isKafkaPending =
      instanceDrawerInstance?.status === InstanceStatus.ACCEPTED ||
      instanceDrawerInstance?.status === InstanceStatus.PREPARING;

    return (
      <React.Suspense fallback={<MASLoading />}>
        <Tabs
          activeKey={instanceDrawerTab.toString()}
          onSelect={(_, tab) => selectTab(tab)}
        >
          <Tab
            eventKey={InstanceDrawerTab.DETAILS.toString()}
            title={<TabTitleText>{t('details')}</TabTitleText>}
          >
            <DetailsTab />
          </Tab>
          <Tab
            eventKey={InstanceDrawerTab.CONNECTION.toString()}
            title={<TabTitleText>{t('connection')}</TabTitleText>}
            data-testid='drawerStreams-tabConnect'
          >
            <ResourcesTab
              externalServer={getExternalServer()}
              isKafkaPending={isKafkaPending}
              tokenEndPointUrl={tokenEndPointUrl}
              instanceId={instanceDrawerInstance?.id}
            />
          </Tab>
        </Tabs>
      </React.Suspense>
    );
  };
