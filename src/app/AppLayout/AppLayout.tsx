import * as React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Nav,
  NavList,
  NavItem,
  NavExpandable,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  PageHeaderTools,
} from '@patternfly/react-core';
import { routes, IAppRoute, IAppRouteGroup } from '@app/routes';
import logo from '@app/bgimages/Patternfly-Logo.svg';
import { KeycloakContext } from '@app/auth/keycloak/KeycloakContext';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);

  const keycloakContext = React.useContext(KeycloakContext);

  const location = useLocation();

  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const { t } = useTranslation();

  function LogoImg() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return <img src={logo} onClick={handleClick} alt="PatternFly Logo" />;
  }

  if (!keycloakContext.keycloak) {
    return (
      // TODO handle this error properly!
      <div>403 Unauthorized</div>
    );
  }

  if (!keycloakContext.keycloak.authenticated) {
    // force the user to log in
    return keycloakContext.keycloak?.login();
  }

  const email = keycloakContext.keycloak.tokenParsed && keycloakContext.keycloak.tokenParsed['email'];

  const HeaderTools = <PageHeaderTools>{email}</PageHeaderTools>;

  const Header = (
    <PageHeader
      logo={<LogoImg />}
      showNavToggle
      isNavOpen={isNavOpen}
      headerTools={HeaderTools}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      aria-label={t('global_navigation')}
    />
  );

  const renderNavItem = (route: IAppRoute, index: number) => {
    return (
      <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`}>
        <NavLink exact to={route.path} activeClassName="pf-m-current">
          {route?.label && t(route.label)}
        </NavLink>
      </NavItem>
    );
  };

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
      // aria-label={t()}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  const Navigation = (
    <Nav id="nav-primary-simple" role="navigation" theme="dark" aria-label={t('global')}>
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) => route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx))
        )}
      </NavList>
    </Nav>
  );
  const Sidebar = <PageSidebar theme="dark" nav={Navigation} isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen} />;
  const PageSkipToContent = <SkipToContent href="#primary-app-container">{t('skip_to_content')}</SkipToContent>;
  return (
    <Page
      mainContainerId="primary-app-container"
      role="main"
      header={Header}
      sidebar={Sidebar}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
