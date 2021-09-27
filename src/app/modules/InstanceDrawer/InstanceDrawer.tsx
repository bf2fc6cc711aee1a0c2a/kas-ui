import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import { MASDrawerProps, MASDrawer } from '@app/common';
import { DetailsTabProps } from './DetailsTab';
import './InstanceDrawer.css';
import {
  InstanceDrawerContent,
  InstanceDrawerContentProps,
} from '@app/modules/InstanceDrawer/InstanceDrawerContent';

export type InstanceDrawerProps = Omit<
  MASDrawerProps,
  'drawerHeaderProps' | 'panelBodyContent' | '[data-ouia-app-id]'
> &
  DetailsTabProps &
  InstanceDrawerContentProps;

const InstanceDrawer: React.FunctionComponent<InstanceDrawerProps> = ({
  initialTab,
  onClose,
  instanceDetail,
  isExpanded,
  isLoading,
  children,
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
  notRequiredDrawerContentBackground,
}) => {
  dayjs.extend(localizedFormat);
  const { t } = useTranslation();

  return (
    <MASDrawer
      isExpanded={isExpanded}
      isLoading={isLoading}
      onClose={onClose}
      panelBodyContent={
        <InstanceDrawerContent
          initialTab={initialTab}
          instanceDetail={instanceDetail}
          tokenEndPointUrl={tokenEndPointUrl}
        />
      }
      drawerHeaderProps={{
        text: { label: t('instance_name') },
        title: { value: instanceDetail?.name, headingLevel: 'h1' },
      }}
      data-ouia-app-id={dataOuiaAppId}
      notRequiredDrawerContentBackground={notRequiredDrawerContentBackground}
    >
      {children}
    </MASDrawer>
  );
};

export { InstanceDrawer };
