import React from "react";
import {
  AlertGroup,
  Alert,
  AlertActionCloseButton,
  AlertVariant,
} from "@patternfly/react-core";

export type AlertType = {
  key: number;
  message: string;
  variant: AlertVariant;
};

type AlertToastGroupProps = {
  alerts: AlertType[];
  onCloseAlert: (key: number) => void;
};

export function AlertToastGroup({ alerts, onCloseAlert }: AlertToastGroupProps) {
  return (
    <AlertGroup isToast>
      {alerts.map(({ key, variant, message }) => (
        <Alert
          key={key}
          isLiveRegion
          variant={AlertVariant[variant]}
          variantLabel=""
          title={message}
          actionClose={
            <AlertActionCloseButton
              title={message}
              onClose={() => onCloseAlert(key)}
            />
          }
        />
      ))}
    </AlertGroup>
  );
}
