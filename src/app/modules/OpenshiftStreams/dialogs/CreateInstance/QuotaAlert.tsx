import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Quota, QuotaType } from '@app/contexts';

export type QuotaAlertProps = {
  quota: Quota | undefined;
};

export const QuotaAlert: React.FC<QuotaAlertProps> = ({ quota }) => {
  const { t } = useTranslation();
  const { data, isServiceDown } = quota || {};
  const kasQuota = data?.get(QuotaType?.kas);
  const kasTrial = data?.get(QuotaType?.kasTrial);

  let titleKey = '';
  let messageKey = '';
  let variant: AlertVariant = AlertVariant.warning;

  if (kasQuota?.remaining === 0) {
    variant = AlertVariant.danger;
    titleKey = 'standard_kafka_alert_title';
    messageKey = 'standard_kafka_alert_message';
  } else if (kasTrial?.allowed === 0) {
    variant = AlertVariant.warning;
    titleKey = 'trial_kafka_alert_title';
    messageKey = 'trial_kafka_alert_message';
  } else if (isServiceDown) {
    titleKey = 'something_went_wrong';
    variant = AlertVariant.danger;
    messageKey = 'ams_service_down_message';
  }

  return (
    <>
      {titleKey && (
        <Alert className="pf-u-mb-md" variant={variant} title={t(titleKey)} aria-live="polite" isInline>
          {t(messageKey)}
        </Alert>
      )}
    </>
  );
};
