import * as React from 'react';
import {
  ApplicationLauncher,
  ApplicationLauncherItem,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

export const Masthead: React.FunctionComponent = ({ children }) => {
  const [helpDropdownOpen, setHelpDropdownOpen] = React.useState(false);
  const appLauncherItems = [
    <ApplicationLauncherItem key="quickstarts" href="#" component={<Link to="/quickstarts">Quick Starts</Link>} />,
  ];
  return (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        <PageHeaderToolsItem>
          <ApplicationLauncher
            aria-label="Help menu"
            onSelect={() => setHelpDropdownOpen(!helpDropdownOpen)}
            onToggle={(isOpen) => setHelpDropdownOpen(isOpen)}
            isOpen={helpDropdownOpen}
            items={appLauncherItems}
            position="right"
            toggleIcon={<QuestionCircleIcon alt="" />}
          />
        </PageHeaderToolsItem>
      </PageHeaderToolsGroup>
      <PageHeaderToolsGroup>{children}</PageHeaderToolsGroup>
    </PageHeaderTools>
  );
};
