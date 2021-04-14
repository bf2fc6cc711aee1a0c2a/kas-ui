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
  EmptyStateVariant,
  EmptyStateSecondaryActions
} from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import SpaceShuttleIcon from '@patternfly/react-icons/dist/js/icons/space-shuttle-icon';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { css } from '@patternfly/react-styles';
import './MASEmptyState.css';

export enum MASEmptyStateVariant {
  GettingStarted = 'GettingStarted',
  NoAccess = 'NoAccess',
  NoResult = 'NoResult',
  NoItems = 'NoItems',
  UnexpectedError = 'UnexpectedError',
  PageNotFound = 'PageNotFound',
}

export type MASEmptyStateProps = {
  titleProps?: Omit<TitleProps, 'children' | 'headingLevel'> & {
    headingLevel?: string;
  };
  emptyStateProps?: Omit<PFEmptyStateProps, 'children' | 'variant'> & {
    variant?: MASEmptyStateVariant | EmptyStateVariant;
  };
  emptyStateIconProps?: EmptyStateIconProps;
  emptyStateBodyProps?: Omit<EmptyStateBodyProps, 'children'> & {
    body?: string | React.ReactNode;
  };
  buttonProps?: Omit<ButtonProps, 'children'> & [{
    title?: string;
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
  children,
}: MASEmptyStateProps) => {
  const { variant: buttonVariant = ButtonVariant.primary, onClick, ...restButtonProps } = buttonProps || {};
  const { title, ...restTitleProps } = titleProps || {};
  const { body, ...restEmptyStateBodyProps } = emptyStateBodyProps || {};
  const { variant: masEmptyStateVariant = MASEmptyStateVariant.GettingStarted, className, ...restEmptyStateProps } =
    emptyStateProps || {};

  const getVariantConfig = () => {
    let varaintConfig: any = {};

    switch (masEmptyStateVariant) {
      case MASEmptyStateVariant.GettingStarted:
        varaintConfig = {
          variant: EmptyStateVariant.xl,
          icon: SpaceShuttleIcon,
          titleSize: TitleSizes['4xl'],
          headingLevel: 'h1',
        };
        break;
      case MASEmptyStateVariant.NoAccess:
        varaintConfig = {
          variant: EmptyStateVariant.large,
          icon: LockIcon,
          titleSize: TitleSizes.xl,
          headingLevel: 'h2',
        };
        break;
      case MASEmptyStateVariant.NoItems:
        varaintConfig = {
          variant: EmptyStateVariant.large,
          icon: PlusCircleIcon,
          titleSize: TitleSizes.xl,
          headingLevel: 'h2',
        };
        break;
      case MASEmptyStateVariant.NoResult:
        varaintConfig = {
          variant: EmptyStateVariant.large,
          icon: SearchIcon,
          titleSize: TitleSizes.lg,
          headingLevel: 'h2',
        };
        break;
      case MASEmptyStateVariant.UnexpectedError:
        varaintConfig = {
          variant: EmptyStateVariant.full,
          icon: ExclamationCircleIcon,
          titleSize: TitleSizes.lg,
          headingLevel: 'h1',
        };
        break;
      case MASEmptyStateVariant.PageNotFound:
        varaintConfig = {
          variant: EmptyStateVariant.full,
          icon: ExclamationTriangleIcon,
          titleSize: TitleSizes.lg,
          headingLevel: 'h1',
        };
        break;
      default:
        varaintConfig = {
          variant: masEmptyStateVariant || EmptyStateVariant.full,
          icon: emptyStateIconProps?.icon,
          titleSize: titleProps?.size,
          headingLevel: titleProps?.headingLevel,
        };
        break;
    }

    return varaintConfig;
  };

  const { variant, icon, titleSize, headingLevel } = getVariantConfig();

  return (
    <>
      <PFEmptyState
        variant={variant}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md', className)}
        {...restEmptyStateProps}
      >
        <EmptyStateIcon icon={icon} {...emptyStateIconProps} />
        {title && (
          <Title headingLevel={headingLevel} size={titleSize} {...restTitleProps}>
            {title}
          </Title>
        )}
        {body && <EmptyStateBody {...restEmptyStateBodyProps}>{body}</EmptyStateBody>}
        {buttonProps && (
          <Button variant={buttonVariant} onClick={onClick} {...restButtonProps}>
            {buttonProps[0].title}
          </Button>
        )}
        {buttonProps && buttonProps.length > 1 &&
          const secondaryButtonProps = buttonProps[]
          <EmptyStateSecondaryActions>
            {buttonProps?.map((button) => {
              return (
                <Button variant="link" onClick={button.onClick} data-testid={button['data-testid']}>{button.title}</Button>
              )
            })}
          </EmptyStateSecondaryActions>
        }
        {children}
      </PFEmptyState>
    </>
  );
};
