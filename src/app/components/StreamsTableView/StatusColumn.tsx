import React from 'react';
import { CheckCircleIcon, PendingIcon, ExclamationCircleIcon, IconSize } from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { InstanceStatus } from '@app/constants';
import './StatusColumn.css';
import { useTranslation } from 'react-i18next';

type StatusColumnProps = {
  status: string;
};

const StatusColumn = ({ status }: StatusColumnProps) => {
  const { t } = useTranslation();
  const getStatus = () => {
    switch (status?.toLowerCase()) {
      case InstanceStatus.COMPLETED:
        return t('ready');
      case InstanceStatus.FAILED:
        return t('failed');
      case InstanceStatus.PROVISIONING:
        return t('creation_in_progress');
      case InstanceStatus.ACCEPTED:
        return t('creation_pending');
      default:
        return t('creation_pending');
    }
  };
  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case InstanceStatus.COMPLETED:
        return <CheckCircleIcon className="mk--instances__table--icon--completed" />;
      case InstanceStatus.FAILED:
        return <ExclamationCircleIcon className="mk--instances__table--icon--failed" />;
      case InstanceStatus.PROVISIONING:
        return <Spinner size={IconSize.md} />;
      case InstanceStatus.ACCEPTED:
        return <PendingIcon />;
      default:
        return <PendingIcon />;
    }
  };

  return (
    <Flex>
      <FlexItem spacer={{ default: 'spacerSm' }}>{getStatusIcon()}</FlexItem>
      <FlexItem>{getStatus()}</FlexItem>
    </Flex>
  );
};

export { StatusColumn };
