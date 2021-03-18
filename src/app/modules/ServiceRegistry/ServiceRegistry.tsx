import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants, ButtonVariant, EmptyStateVariant } from '@patternfly/react-core';
import SpaceShuttleIcon from '@patternfly/react-icons/dist/js/icons/space-shuttle-icon';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { MASEmptyState } from '@app/common';
import { ServiceRegistryHeader, ServiceRegistryDrawer } from './components';

export type ServiceRegistryProps = {
  getConnectToInstancePath?: (data: any) => string;
};

export const ServiceRegistry = ({ getConnectToInstancePath }: ServiceRegistryProps) => {
  const { t } = useTranslation();

  const [isExpandedDrawer, setIsExpandedDrawer] = useState<boolean>(false);
  const [isServiceRegistryLoading, setIsServiceRegistryLoading] = useState<boolean>(false);
  const [serviceAccountDetails, setServiceAccountDetails] = useState<any>(undefined);
  const [notRequiredDrawerContentBackground, setNotRequiredDrawerContentBackground] = useState<boolean>(false);

  const onConnectToRegistry = () => {
    setIsExpandedDrawer(true);
    /**
     * Todo: Dummy test-data will remove after integrate API
     */
    setServiceAccountDetails('test-data');
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
          titleProps={{ title: t('serviceRegistry.welcome_to_service_registry'), headingLevel: 'h1', size: '3xl' }}
          emptyStateBodyProps={{
            body: t('serviceRegistry.welcome_empty_state_body'),
          }}
          buttonProps={{
            title: t('serviceRegistry.create_service_registry'),
            variant: ButtonVariant.primary,
            onClick: onCreateServiceRegistry,
            isLoading: isServiceRegistryLoading,
            spinnerAriaValueText: isServiceRegistryLoading ? t('common.loading') : undefined,
          }}
        />
      </PageSection>
    );
  };

  const renderUnauthorizedUserEmptyState = () => {
    return (
      <PageSection>
        <MASEmptyState
          emptyStateProps={{ variant: EmptyStateVariant.large }}
          emptyStateIconProps={{ icon: LockIcon }}
          titleProps={{ title: t('serviceRegistry.unauthorized_empty_state_title'), headingLevel: 'h2', size: 'lg' }}
          emptyStateBodyProps={{
            body: t('serviceRegistry.unauthorized_empty_state_body'),
          }}
          buttonProps={{
            title: t('serviceRegistry.get_access_to_service_registry'),
            variant: ButtonVariant.primary,
            onClick: getAccessToServiceRegistry,
          }}
        />
      </PageSection>
    );
  };

  return (
    <>
      <ServiceRegistryDrawer
        isExpanded={isExpandedDrawer}
        isLoading={serviceAccountDetails === undefined}
        notRequiredDrawerContentBackground={notRequiredDrawerContentBackground}
        onClose={onCloseDrawer}
      >
        <PageSection variant={PageSectionVariants.light}>
          <ServiceRegistryHeader
            name={''}
            onConnectToRegistry={onConnectToRegistry}
            onDeleteRegistry={onDeleteRegistry}
          />
        </PageSection>
      </ServiceRegistryDrawer>
    </>
  );
};
