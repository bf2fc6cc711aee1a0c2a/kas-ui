import React from 'react';
import { Metrics } from './Metrics';

export const MetricsConnected = () => {
  /**
   * Note : replace kafkaId with your active kakfa instance id
   */
  const kafkaId = '1vX09n2EKVPBDr9Cu9rE47gj67y';
  return <Metrics kafkaId={kafkaId} />;
};
