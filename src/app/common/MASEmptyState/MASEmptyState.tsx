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
import { css } from '@patternfly/react-styles';

export type MASEmptyStateProps = {
  titleProps?: Omit<TitleProps, 'children'>;
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

export const MASEmptyState: React.FC<MASEmptyStateProps> = ({
  titleProps,
  buttonProps,
  emptyStateIconProps,
  emptyStateProps,
  emptyStateBodyProps,
  children,
}: MASEmptyStateProps) => {
  const { variant = ButtonVariant.primary, onClick, ...restButtonProps } = buttonProps || {};
  const { icon = PlusCircleIcon, ...restEmptyStateIconProps } = emptyStateIconProps || {};
  const { title, size = TitleSizes.lg, headingLevel = 'h1', ...restTitleProps } = titleProps || {};
  const { body, ...restEmptyStateBodyProps } = emptyStateBodyProps || {};
  const { className, ...restEmptyStateProps } = emptyStateProps || {};

  return (
    <>
      <PFEmptyState className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md', className)} {...restEmptyStateProps}>
        <EmptyStateIcon icon={icon} {...restEmptyStateIconProps} />
        {title && (
          <Title headingLevel={headingLevel} size={size} {...restTitleProps}>
            {title}
          </Title>
        )}
        {body && <EmptyStateBody {...restEmptyStateBodyProps}>{body}</EmptyStateBody>}
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
