import React from 'react';
import { CheckCircleIcon, PendingIcon, ExclamationCircleIcon, IconSize } from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { InstanceStatus } from '@app/constants';
import { capitalize } from '@app/utils';
import './StatusColumn.css';

type StatusColumnProps = {
  status: string;
};

const StatusColumn = ({ status }: StatusColumnProps) => {
  const statusDisplayName = status === InstanceStatus.ACCEPTED ? 'pending case' : status;

  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case InstanceStatus.COMPLETED:
        return <CheckCircleIcon className="check-circle-icon-color" />;
      case InstanceStatus.FAILED:
        return <ExclamationCircleIcon className="exclamation-circle-icon-color" />;
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
      <FlexItem>{capitalize(statusDisplayName)}</FlexItem>
    </Flex>
  );
};

export { StatusColumn };
