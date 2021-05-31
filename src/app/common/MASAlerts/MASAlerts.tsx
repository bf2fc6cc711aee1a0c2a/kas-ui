import React, { useState, ReactNode, useEffect } from 'react';
import { MASAlertType, MASAlertToastGroup } from './MASAlertToastGroup';
import { AlertVariant } from '@patternfly/react-core';
import { AlertContext } from '@bf2/ui-shared';

type TimeOut = {
  key: number;
  timeOut: NodeJS.Timeout | undefined;
};

export const AlertProvider: React.FunctionComponent = ({ children }) => {
  const [alerts, setAlerts] = useState<MASAlertType[]>([]);
  const [timers, setTimers] = useState<TimeOut[]>([]);

  useEffect(() => {
    const timersKeys = timers.map((timer) => timer.key);
    const timeOuts = alerts
      .filter((alert) => !timersKeys.includes(alert.key))
      .map((alert) => {
        const timeOut = alert?.skipAutoClose ? undefined : setTimeout(() => hideAlert(alert.key), 8000);
        return { key: alert.key, timeOut };
      });
    setTimers([...timers, ...timeOuts]);
    return () => timers.forEach((timer) => timer?.timeOut && clearTimeout(timer.timeOut));
  }, [alerts]);

  const createId = () => new Date().getTime();

  const hideAlert = (key: number) => {
    setAlerts((alerts) => [...alerts.filter((el) => el.key !== key)]);
    setTimers((timers) => [...timers.filter((timer) => timer.key === key)]);
  };

  const addAlert = (
    title: string,
    variant: AlertVariant = AlertVariant.default,
    body?: string | React.ReactElement,
    dataTestId?: string,
    skipAutoClose?: boolean
  ) => {
    setAlerts([...alerts, { key: createId(), title, variant, body, dataTestId, skipAutoClose }]);
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      <MASAlertToastGroup alerts={alerts} onCloseAlert={hideAlert} />
      {children}
    </AlertContext.Provider>
  );
};
