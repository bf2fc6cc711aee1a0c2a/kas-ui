import React from 'react';
import { AlertGroup, Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

export type AlertType = {
  key: number;
  title: string;
  variant: AlertVariant;
  body?: string;
};

type AlertToastGroupProps = {
  alerts: AlertType[];
  onCloseAlert: (key: number) => void;
};

export function AlertToastGroup({ alerts, onCloseAlert }: AlertToastGroupProps) {
  return (
    <AlertGroup isToast>
      {alerts.map(({ key, variant, title, body }) => (
        <Alert
          key={key}
          isLiveRegion
          variant={AlertVariant[variant]}
          variantLabel=""
          title={title}
          actionClose={<AlertActionCloseButton title={title} onClose={() => onCloseAlert(key)} />}
        >
          {body}
        </Alert>
      ))}
    </AlertGroup>
  );
}
