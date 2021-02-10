import React from 'react';
import { useTranslation } from 'react-i18next';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import './InstanceDrawer.css';
import { KafkaRequest } from 'src/openapi';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Drawer } from '@app/common';

export type InstanceDrawerProps = {
  mainToggle?: boolean;
  onClose: () => void;
  isExpanded: boolean;
  instanceDetail?: KafkaRequest;
  activeTab?: 'Details' | 'Connection';
};
const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  mainToggle,
  onClose,
  activeTab,
  instanceDetail,
}) => {
  const { t } = useTranslation();
  const { id, created_at, updated_at, owner } = instanceDetail || {};
  dayjs.extend(localizedFormat);

  const getExternalServer = () => {
    const { bootstrapServerHost } = instanceDetail || {};
    return bootstrapServerHost?.endsWith(':443') ? bootstrapServerHost : `${bootstrapServerHost}:443`;
  };

  return (
    <Drawer
      mainToggle={mainToggle}
      activeTab={activeTab}
      tabTitle1={t('details')}
      tabTitle2={t('connection')}
      onClose={onClose}
      isLoading={instanceDetail === undefined}
      drawerHeaderProps={{
        text: { label: t('instance_name') },
        title: { value: instanceDetail?.name },
      }}
      detailsTabProps={{
        textList: [
          { label: t('cloud_provider'), value: t('amazon_web_services') },
          { label: t('region'), value: t('us_east_north_virginia') },
          { label: t('id'), value: id },
          { label: t('owner'), value: owner },
          { label: t('created'), value: dayjs(created_at).format('LLLL') },
          { label: t('updated'), value: dayjs(updated_at).format('LLLL') },
        ],
        cardDetails: [
          { title: t('topics'), value: 10 },
          { title: t('consumer_groups'), value: 10 },
        ],
      }}
      connectionTabProps={{
        tabTitle1: t('resources'),
        tabTitle2: t('sample_code'),
      }}
      instanceName={instanceDetail?.name}
      externalServer={getExternalServer()}
    />
  );
};

export { InstanceDrawer };
