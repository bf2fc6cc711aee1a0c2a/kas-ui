import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@patternfly/react-core';
import { MASToolbar, ToolbarItemProps } from '@app/common';

export type ServiceAccountsToolbarProps = {
  onCreateServiceAccount: () => void;
};

const ServiceAccountsToolbar: React.FC<ServiceAccountsToolbarProps> = ({
  onCreateServiceAccount: onCreateServiceAccount,
}: ServiceAccountsToolbarProps) => {
  const { t } = useTranslation(['kasTemporaryFixMe']);
  const toolbarItems: ToolbarItemProps[] = [
    {
      item: (
        <Button
          variant='primary'
          onClick={onCreateServiceAccount}
          data-testid={'tableServiceAccounts-buttonCreateServiceAccount'}
        >
          {t('serviceAccount.create_service_account')}
        </Button>
      ),
    },
  ];
  /**
   * Todo: uncomment code when API start support pagination
   */
  // if (total && total > 0 && toolbarItems.length === 1) {
  //   toolbarItems.push({
  //     item: (
  //       <MASPagination
  //         widgetId="pagination-options-menu-top"
  //         itemCount={total}
  //         page={page}
  //         perPage={perPage}
  //         isCompact={true}
  //         titles={{
  //           paginationTitle: t('minimal_pagination'),
  //           perPageSuffix: t('per_page_suffix'),
  //           toFirstPage: t('to_first_page'),
  //           toPreviousPage: t('to_previous_page'),
  //           toLastPage: t('to_last_page'),
  //           toNextPage: t('to_next_page'),
  //           optionsToggle: t('options_toggle'),
  //           currPage: t('curr_page'),
  //         }}
  //       />
  //     ),
  //     variant: 'pagination',
  //     alignment: { default: 'alignRight' },
  //   });
  // }

  return (
    <MASToolbar
      toolbarProps={{
        id: 'instance-toolbar',
        collapseListedFiltersBreakpoint: 'md',
        inset: { xl: 'insetLg' },
      }}
      toolbarItems={toolbarItems}
    />
  );
};

export { ServiceAccountsToolbar };
