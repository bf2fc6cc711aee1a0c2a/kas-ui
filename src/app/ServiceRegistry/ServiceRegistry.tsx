import React, { useState } from 'react';
import { PageSection, PageSectionVariants, ButtonVariant, EmptyStateVariant } from '@patternfly/react-core';
import SpaceShuttleIcon from '@patternfly/react-icons/dist/js/icons/space-shuttle-icon';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { ServiceRegistryHeader, ServiceRegistryDrawer } from '@app/components';
import { MASEmptyState } from '@app/common';

export type ServiceRegistryProps = {
  getConnectToInstancePath?: (data: any) => string;
};

export const ServiceRegistry = ({ getConnectToInstancePath }: ServiceRegistryProps) => {
  const [isExpandedDrawer, setIsExpandedDrawer] = useState<boolean>(false);
  const [isServiceRegistryLoading, setIsServiceRegistryLoading] = useState(false);

  const onConnectToRegistry = () => {
    setIsExpandedDrawer(true);
  };

  const onCloseDrawer = () => {
    setIsExpandedDrawer(false);
  };

  const onDeleteRegistry = () => {
    /**
     * Todo: integrate delete registry api
     */
  };

  const onCreateServiceRegistry = () => {
    /**
     * Todo: integrate create service registry api
     */
  };

  const getAccessToServiceRegistry = () => {
    /**
     * Todo: integrate get access service registry api
     */
  };

  const renderWelcomeEmptyState = () => {
    return (
      <PageSection>
        <MASEmptyState
          emptyStateProps={{ variant: EmptyStateVariant.xl }}
          emptyStateIconProps={{ icon: SpaceShuttleIcon }}
          titleProps={{ title: 'Welcome to Service Registry', headingLevel: 'h1', size: '2xl' }}
          emptyStateBodyProps={{
            body:
              'Store and manage artifacts, like schemas and APIs, with Service Registry. To get started, create your Service Registry.',
          }}
          buttonProps={{
            title: 'Create Service Registry',
            variant: ButtonVariant.primary,
            onClick: onCreateServiceRegistry,
            isLoading: isServiceRegistryLoading,
            spinnerAriaValueText: isServiceRegistryLoading ? 'Loading' : undefined,
          }}
        />
      </PageSection>
    );
  };

  const renderUnauthorizedUserEmptyState = () => {
    return (
      <PageSection>
        <MASEmptyState
          emptyStateProps={{ variant: EmptyStateVariant.xl }}
          emptyStateIconProps={{ icon: LockIcon }}
          titleProps={{ title: "You don't have access to Service Registry", headingLevel: 'h1', size: '2xl' }}
          emptyStateBodyProps={{
            body:
              'You can not set up a Service Registry because your account does not have the appropriate entitlements for accessing Service Registry.',
          }}
          buttonProps={{
            title: 'Get access to Service Registry',
            variant: ButtonVariant.primary,
            onClick: getAccessToServiceRegistry,
          }}
        />
      </PageSection>
    );
  };

  return (
    <ServiceRegistryDrawer isExpanded={isExpandedDrawer} isLoading={false} onClose={onCloseDrawer}>
      <PageSection variant={PageSectionVariants.light}>
        <ServiceRegistryHeader
          name={''}
          onConnectToRegistry={onConnectToRegistry}
          onDeleteRegistry={onDeleteRegistry}
        />
      </PageSection>
    </ServiceRegistryDrawer>
  );
};
