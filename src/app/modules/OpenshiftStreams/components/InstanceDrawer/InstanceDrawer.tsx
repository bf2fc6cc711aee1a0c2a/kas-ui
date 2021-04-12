import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabTitleText, Alert, AlertVariant } from '@patternfly/react-core';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { MASDrawer, MASDrawerProps } from '@app/common';
import { ConnectionTab, ConnectionTabProps } from './ConnectionTab';
import { DetailsTab, DetailsTabProps } from './DetailsTab';
import { InstanceStatus } from '@app/utils';
import './InstanceDrawer.css';

export type InstanceDrawerProps = Pick<
  ConnectionTabProps,
  'getConnectToRoutePath' | 'onConnectToRoute' | 'tokenEndPointUrl'
> &
  Omit<MASDrawerProps, 'drawerHeaderProps' | 'panelBodyContent' | '[data-ouia-app-id]'> &
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
  'data-ouia-app-id': dataOuiaAppId,
  getConnectToRoutePath,
  onConnectToRoute,
  tokenEndPointUrl,
}) => {
  dayjs.extend(localizedFormat);

  const { t } = useTranslation();
  const { name, status } = instanceDetail || {};

  const [activeTab1Key, setActiveTab1Key] = useState<string | number>(0);
  const [activeTab2Key, setActiveTab2Key] = useState<string | number>(0);

  useEffect(() => {
    const selectedTab = activeTab?.toLowerCase() === 'details' ? 0 : 1;
    setActiveTab1Key(selectedTab);
    setActiveTab2Key(0);
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

  const isKafkaPending = status === InstanceStatus.ACCEPTED || status === InstanceStatus.PREPARING;

  const panelBodyContent = () => {
    return (
      <Tabs activeKey={activeTab1Key} onSelect={handleTab1Click}>
        <Tab eventKey={0} title={<TabTitleText>{t('details')}</TabTitleText>}>
          <DetailsTab mainToggle={mainToggle} instanceDetail={instanceDetail} />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('connection')}</TabTitleText>} data-testid="drawerStreams-tabConnect">
          <ConnectionTab
            mainToggle={mainToggle}
            activeKey={activeTab2Key}
            instance={instanceDetail}
            externalServer={getExternalServer()}
            onSelect={onSelectConnectionTab}
            isKafkaPending={isKafkaPending}
            getConnectToRoutePath={getConnectToRoutePath}
            onConnectToRoute={onConnectToRoute}
            tokenEndPointUrl={tokenEndPointUrl}
          />
        </Tab>
      </Tabs>
    );
  };

  const alertMessage = () => {
    if (isKafkaPending) {
      return (
        <Alert
          isInline
          variant={AlertVariant.info}
          title={t('kafka_instance_not_ready_inline_message')}
          style={{ marginTop: '15px' }}
        />
      );
    }
    return <></>;
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
      data-ouia-app-id={dataOuiaAppId}
      inlineAlertMessage={alertMessage()}
    >
      {children}
    </MASDrawer>
  );
};

export { InstanceDrawer };
