import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSection, PageSectionVariants, ButtonVariant } from '@patternfly/react-core';
import { MASEmptyState, MASEmptyStateVariant } from '@app/common';
import { ServiceRegistryHeader, ServiceRegistryDrawer } from './components';

export type ServiceRegistryProps = {
};

export const ServiceRegistry = () => {
  const { t } = useTranslation();

  const [isExpandedDrawer, setIsExpandedDrawer] = useState<boolean>(false);
  const [isServiceRegistryLoading, setIsServiceRegistryLoading] = useState<boolean>(false);
  const [serviceAccountDetails, setServiceAccountDetails] = useState<any>(undefined);
  const [notRequiredDrawerContentBackground, setNotRequiredDrawerContentBackground] = useState<boolean>(false);
  const [isUnauthorizedUser, setIsUnauthorizedUser] = useState<boolean>(false);

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
      <PageSection padding={{ default: 'noPadding' }} isFilled>
        <MASEmptyState
          emptyStateProps={{ variant: MASEmptyStateVariant.GettingStarted }}
          titleProps={{ title: t('serviceRegistry.welcome_to_service_registry') }}
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
      <PageSection padding={{ default: 'noPadding' }} isFilled>
        <MASEmptyState
          emptyStateProps={{ variant: MASEmptyStateVariant.NoAccess }}
          titleProps={{ title: t('serviceRegistry.unauthorized_empty_state_title') }}
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
      {serviceAccountDetails ? (
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
          {isUnauthorizedUser && renderUnauthorizedUserEmptyState()}
        </ServiceRegistryDrawer>
      ) : (
        renderWelcomeEmptyState()
      )}
    </>
  );
};
