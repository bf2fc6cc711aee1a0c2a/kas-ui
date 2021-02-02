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

export type Size = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type FullPageErrorHandlerProps = {
  pageTitles?: {
    variant?: PageSectionVariants;
    headingLevel?: HeadingLevel;
    size?: Size;
    title?: string;
  };
  emptyStateTitles?: {
    variant?: EmptyStateVariant;
    icon?: React.ComponentType<any>;
    headingLevel?: HeadingLevel;
    size?: Size;
    title?: string;
    body?: string;
  };
  children?: React.ReactNode;
};

export const FullPageErrorHandler: React.FC<FullPageErrorHandlerProps> = ({
  pageTitles,
  emptyStateTitles,
  children,
}: FullPageErrorHandlerProps) => {
  return (
    <>
      <PageSection variant={pageTitles?.variant || PageSectionVariants.light}>
        <Level>
          <LevelItem>
            <Title headingLevel={pageTitles?.headingLevel || 'h1'} size={pageTitles?.size || 'lg'}>
              {pageTitles?.title}
            </Title>
          </LevelItem>
        </Level>
      </PageSection>
      <EmptyState variant={emptyStateTitles?.variant || EmptyStateVariant.full}>
        <EmptyStateIcon icon={emptyStateTitles?.icon || LockIcon} />
        <Title headingLevel={emptyStateTitles?.headingLevel || 'h2'} size={emptyStateTitles?.size || 'lg'}>
          {emptyStateTitles?.title}
        </Title>
        <EmptyStateBody>
          {emptyStateTitles?.body}
          {children}
        </EmptyStateBody>
      </EmptyState>
    </>
  );
};
