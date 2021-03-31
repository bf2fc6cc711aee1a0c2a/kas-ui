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
  EmptyStateSecondaryActions
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { css } from '@patternfly/react-styles';
import './MASEmptyState.css';

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
    'data-testid'?: string;
  };
  secondaryButtonProps?: [{
    title: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    'data-testid'?: string;
  }];
  children?: React.ReactNode;
};

export const MASEmptyState: React.FC<MASEmptyStateProps> = ({
  titleProps,
  buttonProps,
  emptyStateIconProps,
  emptyStateProps,
  emptyStateBodyProps,
  secondaryButtonProps,
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
        {secondaryButtonProps && secondaryButtonProps.length > 0 && 
          <EmptyStateSecondaryActions>
            {secondaryButtonProps?.map((button) => {
              return (
                <Button variant="link" onClick={button.onClick} {...secondaryButtonProps}>{button.title}</Button>
              )
            })}
          </EmptyStateSecondaryActions>
        }
        {children}
      </PFEmptyState>
    </>
  );
};
