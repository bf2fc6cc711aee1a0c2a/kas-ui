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
  children?: React.ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  titleProps,
  buttonProps,
  emptyStateIconProps,
  emptyStateProps,
  emptyStateBodyProps,
  children,
}: EmptyStateProps) => {
  const { variant = ButtonVariant.primary, onClick, ...restButtonProps } = buttonProps || {};
  const { icon = PlusCircleIcon, ...restEmptyStateIconProps } = emptyStateIconProps || {};
  const { title, size = TitleSizes.lg, headingLevel, ...restTitleProps } = titleProps || {};
  const { body, ...restEmptyStateBodyProps } = emptyStateBodyProps || {};

  return (
    <>
      <PFEmptyState {...emptyStateProps}>
        <EmptyStateIcon icon={icon} {...restEmptyStateIconProps} />
        {title && (
          <Title headingLevel={headingLevel} size={size} {...restTitleProps}>
            {title}
          </Title>
        )}
        <EmptyStateBody {...restEmptyStateBodyProps}>{body}</EmptyStateBody>
        {buttonProps?.title && (
          <Button variant={variant} onClick={onClick} {...restButtonProps}>
            {buttonProps?.title}
          </Button>
        )}
        {children}
      </PFEmptyState>
    </>
  );
};
