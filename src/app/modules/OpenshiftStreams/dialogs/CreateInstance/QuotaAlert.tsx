import React from 'react';
import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Quota, QuotaType, QuotaValue } from '@bf2/ui-shared';

export type QuotaAlertProps = {
  quota: Quota | undefined;
  hasKafkaCreationFailed?: boolean;
  loadingQuota: boolean;
  hasUserTrialKafka?: boolean;
};

export const QuotaAlert: React.FC<QuotaAlertProps> = ({
  quota,
  hasKafkaCreationFailed,
  loadingQuota,
  hasUserTrialKafka,
}) => {
  const { t } = useTranslation();
  const { data, isServiceDown } = quota || {};
  const kasQuota: QuotaValue | undefined = data?.get(QuotaType?.kas);
  const kasTrial: QuotaValue | undefined = data?.get(QuotaType?.kasTrial);

  let titleKey = '';
  let messageKey = '';
  let variant: AlertVariant = AlertVariant.warning;

  //if user has no standard quota and no trial quota
  if (kasQuota?.remaining === 0 && kasTrial?.remaining === 0) {
    variant = AlertVariant.warning;
    titleKey = 'no_quota_kafka_alert_title';
    messageKey = 'no_quota_kafka_alert_message';
  }
  //if user has no standard quota and has trial quota
  else if ((!kasQuota || kasQuota?.remaining === 0) && kasTrial && kasTrial?.remaining > 0) {
    variant = AlertVariant.warning;
    titleKey = 'trial_kafka_title';
    messageKey = 'trial_kafka_message';
  }
  //if user has no standard quota
  else if (kasQuota && kasQuota?.remaining === 0) {
    variant = AlertVariant.danger;
    titleKey = 'standard_kafka_alert_title';
    messageKey = 'standard_kafka_alert_message';
  }
  //if service down or any error
  else if (isServiceDown) {
    titleKey = 'something_went_wrong';
    variant = AlertVariant.danger;
    messageKey = 'ams_service_down_message';
  }
  //if user has already 1 trial kafka instance
  else if (hasUserTrialKafka) {
    variant = AlertVariant.warning;
    titleKey = 'deploy_one_instance_alert_title';
  }
  //if kafka creation failed for quota related
  else if (hasKafkaCreationFailed) {
    variant = AlertVariant.danger;
    titleKey = 'kafka_creation_failed_alert_title';
    messageKey = 'kafka_creation_failed_alert_message';
  }

  return (
    <>
      {loadingQuota && (
        <Alert
          className="pf-u-mb-md"
          variant={AlertVariant.info}
          title={t('instance_checking_message')}
          aria-live="polite"
          isInline
          customIcon={<Spinner size="md" aria-valuetext="Checking kafka availability" />}
        />
      )}

      {titleKey && (
        <Alert className="pf-u-mb-md" variant={variant} title={t(titleKey)} aria-live="polite" isInline>
          {t(messageKey)}
        </Alert>
      )}
    </>
  );
};
