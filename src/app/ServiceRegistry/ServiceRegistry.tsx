import React from 'react';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { ServiceRegistryHeader } from '@app/components';

export const ServiceRegistry = () => {
  const onConnectToRegistry = () => {};

  const onDeleteRegistry = () => {};

  return (
    <PageSection variant={PageSectionVariants.light}>
      <ServiceRegistryHeader name={''} onConnectToRegistry={onConnectToRegistry} onDeleteRegistry={onDeleteRegistry} />
    </PageSection>
  );
};
