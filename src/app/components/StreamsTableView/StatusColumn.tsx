import React from 'react';
import { CheckCircleIcon, PendingIcon, ExclamationCircleIcon, IconSize } from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { InstanceStatus } from '@app/constants';
import './StatusColumn.css';
import { useTranslation } from 'react-i18next';
import { statusOptions } from '@app/utils/utils';

type StatusColumnProps = {
  status: string;
};

const StatusColumn = ({ status }: StatusColumnProps) => {
  const { t } = useTranslation();
  const getStatus = () => {
    switch (status?.toLowerCase()) {
      case statusOptions[0].value:
        return t(statusOptions[0].label);
      case statusOptions[1].value:
        return t(statusOptions[1].label);
      case statusOptions[2].value:
        return t(statusOptions[2].label);
      case statusOptions[3].value:
        return t(statusOptions[3].label);
      default:
        return t('creation_pending');
    }
  };

  const getStatusIcon = () => {
    switch (status?.toLowerCase()) {
      case statusOptions[0].value:
        return <CheckCircleIcon className="check-circle-icon-color" />;
      case statusOptions[1].value:
        return <ExclamationCircleIcon className="exclamation-circle-icon-color" />;
      case statusOptions[2].value:
          return <PendingIcon />;
      case statusOptions[3].value:
        return <Spinner size={IconSize.md} />;
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
