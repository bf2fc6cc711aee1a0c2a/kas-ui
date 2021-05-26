import React from 'react';
import { AlertGroup, Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

export type MASAlertType = {
  key: number;
  title: string;
  variant: AlertVariant;
  body?: string | React.ReactElement;
  dataTestId?: string;
  skipAutoClose?: boolean;
};

type AlertToastGroupProps = {
  alerts: MASAlertType[];
  onCloseAlert: (key: number) => void;
};

export const MASAlertToastGroup: React.FunctionComponent<AlertToastGroupProps> = ({ alerts, onCloseAlert }: AlertToastGroupProps) => {
  return (
    <AlertGroup isToast>
      {alerts.map(({ key, variant, title, body, dataTestId }) => (
        <Alert
          key={key}
          isLiveRegion
          variant={AlertVariant[variant]}
          variantLabel=""
          title={title}
          actionClose={<AlertActionCloseButton title={title} onClose={() => onCloseAlert(key)} />}
          data-testid={dataTestId}
        >
          {body}
        </Alert>
      ))}
    </AlertGroup>
  );
}
