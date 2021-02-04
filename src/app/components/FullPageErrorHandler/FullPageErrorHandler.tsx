import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export type TitleSize = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type FullPageErrorHandlerProps = {
  pageTitle?: {
    variant?: PageSectionVariants;
    headingLevel?: HeadingLevel;
    size?: TitleSize;
    title?: string;
  };
  emptyStateTitle?: {
    variant?: EmptyStateVariant;
    icon?: React.ComponentType<any>;
    headingLevel?: HeadingLevel;
    size?: TitleSize;
    title?: string;
    body?: string;
  };
  children?: React.ReactNode;
};

export const FullPageErrorHandler: React.FC<FullPageErrorHandlerProps> = ({
  pageTitle,
  emptyStateTitle,
  children,
}: FullPageErrorHandlerProps) => {
  return (
    <>
      <PageSection variant={pageTitle?.variant || PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel={pageTitle?.headingLevel || 'h1'} size={pageTitle?.size || 'lg'}>
              {pageTitle?.title}
            </Title>
          </LevelItem>
        </Level>
      </PageSection>
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
    </>
  );
};
