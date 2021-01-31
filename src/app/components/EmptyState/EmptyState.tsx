import React from 'react';
import {
  Title,
  Button,
  EmptyState as PFEmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  TitleSizes,
  TitleProps,
  ButtonProps,
  EmptyStateIconProps,
  EmptyStateProps as PFEmptyStateProps,
  EmptyStateBodyProps,
  ButtonVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

export type EmptyStateProps = {
  titleProps: Omit<TitleProps, 'children'>;
  emptyStateProps?: Omit<PFEmptyStateProps, 'children'>;
  emptyStateIconProps?: EmptyStateIconProps;
  emptyStateBodyProps?: Omit<EmptyStateBodyProps, 'children'> & {
    body?: string | React.ReactNode;
  };
  buttonProps?: Omit<ButtonProps, 'children'> & {
    title?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  };
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  titleProps,
  buttonProps,
  emptyStateIconProps,
  emptyStateProps,
  emptyStateBodyProps,
}: EmptyStateProps) => {
  const { variant = ButtonVariant.primary, onClick, ...restButton } = buttonProps || {};
  const { icon = PlusCircleIcon, ...restEmptyStateIcon } = emptyStateIconProps || {};
  const { title, size = TitleSizes.lg, headingLevel, ...restTitle } = titleProps || {};
  const { body, ...restEmptyStateBodyProps } = emptyStateBodyProps || {};

  return (
    <>
      <PFEmptyState {...emptyStateProps}>
        <EmptyStateIcon icon={icon} {...restEmptyStateIcon} />
        <Title headingLevel={headingLevel} size={size} {...restTitle}>
          {title}
        </Title>
        <EmptyStateBody {...restEmptyStateBodyProps}>{body}</EmptyStateBody>
        {buttonProps?.title && (
          <Button variant={variant} onClick={onClick} {...restButton}>
            {buttonProps?.title}
          </Button>
        )}
      </PFEmptyState>
    </>
  );
};
