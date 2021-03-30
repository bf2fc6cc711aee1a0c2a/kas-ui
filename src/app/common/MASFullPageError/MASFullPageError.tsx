import React from 'react';
import { PageSection, PageSectionVariants, PageSectionProps } from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { MASEmptyState, MASEmptyStateProps } from '@app/common';

export type MASFullPageErrorProps = MASEmptyStateProps & {
  pageSection?: Omit<PageSectionProps, 'children'>;
};

export const MASFullPageError: React.FC<MASFullPageErrorProps> = ({
  pageSection,
  titleProps,
  emptyStateProps,
  emptyStateIconProps,
  emptyStateBodyProps,
  buttonProps,
}: MASFullPageErrorProps) => {
  const { variant = PageSectionVariants.default, padding, ...restPageSectionProps } = pageSection || {};
  return (
    <PageSection variant={variant} {...restPageSectionProps} padding={padding || { default: 'noPadding' }} isFilled>
      <MASEmptyState
        titleProps={titleProps}
        emptyStateProps={emptyStateProps}
        emptyStateIconProps={{
          icon: emptyStateIconProps?.icon || LockIcon,
          ...emptyStateIconProps,
        }}
        emptyStateBodyProps={emptyStateBodyProps}
        buttonProps={buttonProps}
      />
    </PageSection>
  );
};
