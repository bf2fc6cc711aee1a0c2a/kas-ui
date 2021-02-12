import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  TitleSizes,
  PageSectionProps,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export type HeadingLevel = 'h1' | 'h2' | 'h3';

export type MASFullPageErrorHandlerProps = {
  pageSection?: Omit<PageSectionProps, 'children'>;
  emptyStateTitle?: {
    variant?: EmptyStateVariant;
    icon?: React.ComponentType<any>;
    headingLevel?: HeadingLevel;
    size?: TitleSizes;
    title?: string;
    body?: string;
  };
  children?: React.ReactNode;
};

export const MASFullPageErrorHandler: React.FC<MASFullPageErrorHandlerProps> = ({
  pageSection,
  emptyStateTitle,
  children,
}: MASFullPageErrorHandlerProps) => {
  const { variant = PageSectionVariants.light, ...restPageSectionProps } = pageSection || {};
  return (
    <PageSection variant={variant} {...restPageSectionProps}>
      <EmptyState variant={emptyStateTitle?.variant || EmptyStateVariant.full}>
        <EmptyStateIcon icon={emptyStateTitle?.icon || LockIcon} />
        <Title headingLevel={emptyStateTitle?.headingLevel || 'h2'} size={emptyStateTitle?.size || 'lg'}>
          {emptyStateTitle?.title}
        </Title>
        <EmptyStateBody>
          {emptyStateTitle?.body}
          {children}
        </EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};
