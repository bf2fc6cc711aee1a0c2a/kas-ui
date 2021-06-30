import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import { InstanceDrawerConnected } from './InstanceDrawerConnected';
import { RootModal } from '@app/common';
import { initI18N } from '@i18n/i18n';

const InstanceDrawerFederated = ({
  isExpanded,
  activeTab,
  onClose,
  'data-ouia-app-id': dataOuiaAppId,
  tokenEndPointUrl,
  children,
  mainToggle,
  instanceDetail,
  setIsOpenDeleteInstanceModal,
  isOpenDeleteInstanceModal,
}) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={initI18N()}>
        <RootModal>
          <InstanceDrawerConnected
            isExpanded={isExpanded}
            activeTab={activeTab}
            onClose={onClose}
            data-ouia-app-id={dataOuiaAppId}
            tokenEndPointUrl={tokenEndPointUrl}
            mainToggle={mainToggle}
            isLoading={instanceDetail === undefined}
            instanceDetail={instanceDetail}
            setIsOpenDeleteInstanceModal={setIsOpenDeleteInstanceModal}
            isOpenDeleteInstanceModal={isOpenDeleteInstanceModal}
          >
            {children}
          </InstanceDrawerConnected>
        </RootModal>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default InstanceDrawerFederated;
