import React from 'react';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import {
  InstanceDrawer,
  InstanceDrawerProps,
} from '@app/modules/InstanceDrawer/InstanceDrawer';
import { FederatedProps } from '@app/contexts';
import { ModalProvider } from '@rhoas/app-services-ui-components';
import { KasModalLoader } from '@app/modals';
import {
  InstanceDrawerContextProvider,
  InstanceDrawerContextProviderProps,
} from '@app/modules/InstanceDrawer/contexts/InstanceDrawerContext';

export type InstanceDrawerFederatedProps = InstanceDrawerProps &
  FederatedProps &
  InstanceDrawerContextProviderProps;

const InstanceDrawerFederated: React.FunctionComponent<
  InstanceDrawerFederatedProps
> = ({
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
  renderContent,
  initialInstance,
  initialNoInstances,
  initialTab,
}) => {
  return (
    <ModalProvider>
      <InstanceDrawerContextProvider
        initialInstance={initialInstance}
        initialNoInstances={initialNoInstances}
        initialTab={initialTab}
      >
        <InstanceDrawer
          data-ouia-app-id={dataOuiaAppId}
          tokenEndPointUrl={tokenEndPointUrl}
          renderContent={renderContent}
        />
      </InstanceDrawerContextProvider>
      <KasModalLoader />
    </ModalProvider>
  );
};

export default InstanceDrawerFederated;
