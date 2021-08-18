import React from 'react';
import { Metrics, MetricsProps } from '@app/modules/Metrics/Metrics';
import { initI18N } from '@i18n/i18n';
import { I18nextProvider } from 'react-i18next';

// Version of Metrics for federation

const MetricsFederated: React.FunctionComponent<MetricsProps> = ({ kafkaId, onCreateTopic }) => {
  return (
    <I18nextProvider i18n={initI18N()}>
      <Metrics kafkaId={kafkaId} onCreateTopic={onCreateTopic} />
    </I18nextProvider>
  );
};

export default MetricsFederated;
