import React from 'react';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { ServiceRegistryHeader } from '@app/components';

export type ServiceRegistryProps = {
  getConnectToInstancePath?: (data: any) => string;
};

export const ServiceRegistry = ({ getConnectToInstancePath }: ServiceRegistryProps) => {
  const onConnectToRegistry = () => {};

  const onDeleteRegistry = () => {};

  return (
    <PageSection variant={PageSectionVariants.light}>
      <ServiceRegistryHeader name={''} onConnectToRegistry={onConnectToRegistry} onDeleteRegistry={onDeleteRegistry} />
    </PageSection>
  );
};
