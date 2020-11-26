import * as React from 'react';
import { NavLink, useLocation, useHistory } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  NavExpandable,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent, PageHeaderTools, Button
} from '@patternfly/react-core';
import { routes, IAppRoute, IAppRouteGroup } from '@app/routes';
import logo from '@app/bgimages/Patternfly-Logo.svg';
import { AuthContext } from '@app/auth/AuthContext';
import { KeycloakContext } from '@app/auth/keycloak/KeycloakContext';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({children}) => {
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
  }
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  function LogoImg() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return (
      <img src={logo} onClick={handleClick} alt="PatternFly Logo" />
    );
  }

  const login = () => {
    console.log("Logging you in...");
  };

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

  const email = keycloakContext.keycloak.tokenParsed['email'];

  const HeaderTools =
    (
      <PageHeaderTools>{email}</PageHeaderTools>
    );

  const Header = (
    <PageHeader
      logo={<LogoImg />}
      showNavToggle
      isNavOpen={isNavOpen}
      headerTools={HeaderTools}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
    />
  );



  const renderNavItem = (route: IAppRoute, index: number) => (
    <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`}>
      <NavLink exact to={route.path} activeClassName="pf-m-current">
        {route.label}
      </NavLink>
    </NavItem>
  );

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) => route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx))
        )}
      </NavList>
    </Nav>
  );
  const Sidebar = (
    <PageSidebar
      theme="dark"
      nav={Navigation}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen} />
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      sidebar={Sidebar}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
}

export { AppLayout };
