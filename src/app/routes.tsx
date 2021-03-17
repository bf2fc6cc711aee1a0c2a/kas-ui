import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { MASPageNotFound } from '@app/common/MASPageNotFound/MASPageNotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { OpenshiftStreamsConnected } from '@app/modules/OpenshiftStreams';
import { ServiceRegistryConnected } from '@app/modules/ServiceRegistry';

let routeFocusTimer: number;

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: OpenshiftStreamsConnected,
    exact: true,
    // t('openshift_streams')
    label: 'OpenShift Streams',
    path: '/',
    title: 'OpenShift Streams',
  },
  {
    component: ServiceRegistryConnected,
    exact: true,
    label: 'Service Registry',
    path: '/service-registry',
    title: 'Service Registry',
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, ...rest }: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={MASPageNotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <LastLocationProvider>
      <Switch>
        {flattenedRoutes.map(({ path, exact, component, title, isAsync }, idx) => (
          <RouteWithTitleUpdates
            path={path}
            exact={exact}
            component={component}
            key={idx}
            title={title}
            isAsync={isAsync}
          />
        ))}
        <PageNotFound title={t('404_page_not_found')} />
      </Switch>
    </LastLocationProvider>
  );
};

export { AppRoutes, routes };
