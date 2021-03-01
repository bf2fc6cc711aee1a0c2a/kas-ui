import React from 'react';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { ServiceRegistryHeader } from './ServiceRegistryHeader';

export type ServiceRegistryProps = {
  children?: React.ReactNode;
};

export const ServiceRegistry = ({ children }: ServiceRegistryProps) => {
  const onConnectToRegistry = () => {};

  const onDeleteRegistry = () => {};

  return (
    <PageSection variant={PageSectionVariants.light}>
      <ServiceRegistryHeader name={''} onConnectToRegistry={onConnectToRegistry} onDeleteRegistry={onDeleteRegistry} />
      {children}
    </PageSection>
  );
};
