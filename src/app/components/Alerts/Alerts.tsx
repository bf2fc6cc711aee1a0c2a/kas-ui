import React, {
  useState,
  createContext,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { AlertType, AlertToastGroup } from "./AlertToastGroup";
import { AlertVariant } from "@patternfly/react-core";

export type AlertContextProps = {
  addAlert: (message: string, variant?: AlertVariant) => void;
};

export const AlertContext = createContext<AlertContextProps>({
  addAlert: () => {},
});

export const useAlerts = () => useContext(AlertContext);

type TimeOut = {
  key: number;
  timeOut: NodeJS.Timeout;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [timers, setTimers] = useState<TimeOut[]>([]);

  useEffect(() => {
    const timersKeys = timers.map((timer) => timer.key);
    const timeOuts = alerts
      .filter((alert) => !timersKeys.includes(alert.key))
      .map((alert) => {
        const timeOut = setTimeout(() => hideAlert(alert.key), 8000);
        return { key: alert.key, timeOut };
      });
    setTimers([...timers, ...timeOuts]);
    return () => timers.forEach((timer) => clearTimeout(timer.timeOut));
  }, [alerts]);

  const createId = () => new Date().getTime();

  const hideAlert = (key: number) => {
    setAlerts((alerts) => [...alerts.filter((el) => el.key !== key)]);
    setTimers((timers) => [...timers.filter((timer) => timer.key === key)]);
  };

  const addAlert = (
    message: string,
    variant: AlertVariant = AlertVariant.default
  ) => {
    setAlerts([...alerts, { key: createId(), message, variant }]);
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      <AlertToastGroup alerts={alerts} onCloseAlert={hideAlert} />
      {children}
    </AlertContext.Provider>
  );
};
