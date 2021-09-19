import React from 'react';
import { I18nextProvider } from 'react-i18next';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';
import {
  InstanceDrawer,
  InstanceDrawerProps,
} from '@app/modules/InstanceDrawer/InstanceDrawer';
import { FederatedProps } from '@app/contexts';

export type InstanceDrawerFederatedProps = InstanceDrawerProps & FederatedProps;

const InstanceDrawerFederated: React.FunctionComponent<InstanceDrawerFederatedProps> =
  ({
    isExpanded,
    initialTab,
    onClose,
    'data-ouia-app-id': dataOuiaAppId,
    tokenEndPointUrl,
    children,
    instanceDetail,
  }) => {
    return (
      <I18nextProvider i18n={initI18N()}>
        <RootModal>
          <InstanceDrawer
            isExpanded={isExpanded}
            initialTab={initialTab}
            onClose={onClose}
            data-ouia-app-id={dataOuiaAppId}
            tokenEndPointUrl={tokenEndPointUrl}
            isLoading={instanceDetail === undefined}
            instanceDetail={instanceDetail}
          >
            {children}
          </InstanceDrawer>
        </RootModal>
      </I18nextProvider>
    );
  };

export default InstanceDrawerFederated;
