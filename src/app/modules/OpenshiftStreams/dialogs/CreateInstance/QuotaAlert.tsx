import React from 'react';
import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Quota, QuotaType, QuotaValue } from '@bf2/ui-shared';

export type QuotaAlertProps = {
  quota: Quota | undefined;
  hasKafkaCreationFailed?: boolean;
  loadingQuota: boolean;
  hasUserTrialKafka?: boolean;
  isKasTrial?: boolean;
};

export const QuotaAlert: React.FC<QuotaAlertProps> = ({
  quota,
  hasKafkaCreationFailed,
  loadingQuota,
  hasUserTrialKafka,
  isKasTrial,
}) => {
  const { t } = useTranslation();
  const { data, isServiceDown } = quota || {};
  const kasQuota: QuotaValue | undefined = data?.get(QuotaType?.kas);
  const kasTrial: QuotaValue | undefined = data?.get(QuotaType?.kasTrial);

  let titleKey = '';
  let messageKey = '';
  let variant: AlertVariant = AlertVariant.warning;

  //trial quota flows
  //if user has no standard quota and already has a trial instance
  if (!kasQuota && kasTrial && hasUserTrialKafka) {
    titleKey = 'trial_kafka_title';
    variant = AlertVariant.warning;
    messageKey = 'deploy_one_instance_alert_message';
  }
  //if user has no standard quota and no trial quota
  else if (!kasQuota && !kasTrial && !loadingQuota) {
    variant = AlertVariant.warning;
    titleKey = 'no_quota_kafka_alert_title';
    messageKey = 'no_quota_kafka_alert_message';
  }
  //if user has no standard quota and trial instances are available
  else if (!kasQuota && kasTrial && !hasUserTrialKafka) {
    variant = AlertVariant.info;
    titleKey = 'trial_quota_kafka_title';
  }
  //standard quota flows
  //if user has standard quota but all allowed instances are already provisioned
  else if (kasQuota && kasQuota?.remaining === 0) {
    variant = AlertVariant.warning;
    titleKey = 'standard_kafka_alert_title';
    messageKey = 'standard_kafka_alert_message';
  }
  //if user has standard quota and 1 or more allowed instances are available
  else if (kasQuota && kasQuota?.remaining > 0) {
    //don't show alert
    titleKey = '';
  }
  //if kafka creation failed for quota related
  if (hasKafkaCreationFailed) {
    variant = AlertVariant.danger;
    titleKey = 'kafka_creation_failed_alert_title';
    messageKey = kasQuota
      ? 'standard_kafka_creation_failed_alert_message'
      : 'trial_kafka_creation_failed_alert_message';
  }
  //if service down or any error
  if (isServiceDown) {
    titleKey = 'something_went_wrong';
    variant = AlertVariant.danger;
    messageKey = 'ams_service_down_message';
  }

  return (
    <>
      {loadingQuota && (
        <Alert
          className='pf-u-mb-md'
          variant={AlertVariant.info}
          title={t('instance_checking_message')}
          aria-live='polite'
          isInline
          customIcon={
            <Spinner size='md' aria-valuetext='Checking kafka availability' />
          }
        />
      )}

      {titleKey && (
        <Alert
          className='pf-u-mb-md'
          variant={variant}
          title={t(titleKey)}
          aria-live='polite'
          isInline
        >
          {t(messageKey)}
        </Alert>
      )}
    </>
  );
};
