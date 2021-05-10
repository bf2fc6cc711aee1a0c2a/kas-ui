import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import PendingIcon from '@patternfly/react-icons/dist/js/icons/pending-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { statusOptions } from '@app/utils/utils';
import './StatusColumn.css';

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
        return <Spinner size="md" aria-label={instanceName} aria-valuetext="Creation in progress" />;
      case statusOptions[5].value: // 'deprovision'
      case statusOptions[6].value: // 'deleted'
        return;
      default:
        return <PendingIcon />;
    }
  };

  return (
    <Flex>
      {getStatusIcon() && <FlexItem spacer={{ default: 'spacerSm' }}>{getStatusIcon()}</FlexItem>}
      <FlexItem>{getStatus()}</FlexItem>
    </Flex>
  );
};

export { StatusColumn };
