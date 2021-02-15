import React from 'react';
import { CheckCircleIcon, PendingIcon, ExclamationCircleIcon, IconSize } from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import './StatusColumn.css';
import { useTranslation } from 'react-i18next';
import { statusOptions } from '@app/utils/utils';

type StatusColumnProps = {
  status: string;
  instanceName: string;
};

const StatusColumn = ({ status, instanceName }: StatusColumnProps) => {
  const { t } = useTranslation();
  const getStatus = () => {
    const filteredstatus = statusOptions.filter((st) => st.value === status?.toLowerCase());
    if (filteredstatus.length === 1) {
      return t(filteredstatus[0].value);
    } else {
      return t('creation_pending');
    }
  };

  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case statusOptions[0].value: // 'ready'
        return <CheckCircleIcon className="mk--instances__table--icon--completed" />;
      case statusOptions[1].value: // 'failed'
        return <ExclamationCircleIcon className="mk--instances__table--icon--failed" />;
      case statusOptions[2].value: // 'accepted'
        return <PendingIcon />;
      case statusOptions[3].value: // 'provisioning'
      case statusOptions[4].value: // 'preparing'
        return <Spinner size={IconSize.md} aria-label={instanceName} aria-valuetext="Creation in progress" />;
      case statusOptions[5].value: // 'deprovision'
        return;
      default:
        return <PendingIcon />;
    }
  };

  const icon = getStatusIcon();
  return (
    <Flex>
      {icon && <FlexItem spacer={{ default: 'spacerSm' }}>{icon}</FlexItem>}
      <FlexItem>{getStatus()}</FlexItem>
    </Flex>
  );
};

export { StatusColumn };
