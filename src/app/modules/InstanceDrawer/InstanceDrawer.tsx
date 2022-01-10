import React, { ReactElement, useMemo, VoidFunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import '@patternfly/react-styles/css/utilities/Alignment/alignment.css';
import { MASDrawer, MASDrawerProps } from '@app/common';
import './InstanceDrawer.css';
import {
  InstanceDrawerContent,
  InstanceDrawerContentProps,
} from '@app/modules/InstanceDrawer/InstanceDrawerContent';
import { useInstanceDrawer } from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';
import { KafkaRequest } from '@rhoas/kafka-management-sdk';

export type InstanceDrawerProps = Omit<
  MASDrawerProps,
  | 'drawerHeaderProps'
  | 'panelBodyContent'
  | '[data-ouia-app-id]'
  | 'isExpanded'
  | 'isLoading'
  | 'onClose'
  | 'notRequiredDrawerContentBackground'
  | 'children'
> &
  InstanceDrawerContentProps & {
    renderContent: (props: {
      openDrawer: () => void;
      closeDrawer: () => void;
      setInstance: (instance: KafkaRequest) => void;
    }) => ReactElement;
  };

const InstanceDrawer: VoidFunctionComponent<InstanceDrawerProps> = ({
  renderContent,
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
}) => {
  dayjs.extend(localizedFormat);
  const { t } = useTranslation(['kasTemporaryFixMe']);
  const {
    isInstanceDrawerOpen,
    instanceDrawerInstance,
    openInstanceDrawer,
    closeInstanceDrawer,
    setInstanceDrawerInstance,
    noInstances,
  } = useInstanceDrawer();

  const content = useMemo(
    () =>
      renderContent({
        closeDrawer: closeInstanceDrawer,
        openDrawer: openInstanceDrawer,
        setInstance: setInstanceDrawerInstance,
      }),
    []
  );

  return (
    <MASDrawer
      isExpanded={isInstanceDrawerOpen}
      isLoading={instanceDrawerInstance === undefined}
      onClose={closeInstanceDrawer}
      panelBodyContent={
        <InstanceDrawerContent tokenEndPointUrl={tokenEndPointUrl} />
      }
      drawerHeaderProps={{
        text: { label: t('instance_name') },
        title: { value: instanceDrawerInstance?.name, headingLevel: 'h1' },
      }}
      data-ouia-app-id={dataOuiaAppId}
      notRequiredDrawerContentBackground={noInstances}
    >
      {content}
    </MASDrawer>
  );
};

export { InstanceDrawer };
