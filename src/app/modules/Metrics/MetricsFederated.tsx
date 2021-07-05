import React from 'react';
import { Metrics, MetricsProps } from '@app/modules/Metrics/Metrics';
import { RootModal, AlertProvider } from '@app/common';
import { BrowserRouter } from 'react-router-dom';
import { initI18N } from '@i18n/i18n';
import { I18nextProvider } from 'react-i18next';

// Version of Metrics for federation

const MetricsFederated: React.FunctionComponent<MetricsProps> = ({ kafkaId }) => {
  return (
    // TODO don't add BrowserRouter here - see  https://github.com/bf2fc6cc711aee1a0c2a/mk-ui-frontend/issues/74
    <BrowserRouter>
      <I18nextProvider i18n={initI18N()}>
        <AlertProvider>
          <RootModal>
            <Metrics kafkaId={kafkaId} />
          </RootModal>
        </AlertProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default MetricsFederated;
