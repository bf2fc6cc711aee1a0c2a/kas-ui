import { useTranslation } from 'react-i18next';
import React from 'react';

export const useTooltipContent = (
  isMaxFilter: boolean,
  fieldName?: string
): React.ReactElement => {
  const { t } = useTranslation(['kasTemporaryFixMe']);
  if (isMaxFilter) {
    return <div>{t('max_filter_message')}</div>;
  }
  if (fieldName === 'owner') {
    return <div>{t('owner_field_invalid_message', { name: fieldName })}</div>;
  }
  return <div>{t('input_field_invalid_message', { name: fieldName })}</div>;
};
