import React from 'react';
import { ServiceAccountToolbar } from '@rhoas/app-services-ui-components';

export type ServiceAccountsToolbarProps = {
  onSearch: (State) => void;
  onCreateServiceAccountClick: () => void;
};

const ServiceAccountsToolbar: React.FC<ServiceAccountsToolbarProps> = ({
  onSearch,
  onCreateServiceAccountClick,
}: ServiceAccountsToolbarProps) => {
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
    <ServiceAccountToolbar
      onSearch={onSearch}
      onCreateServiceAccountClick={onCreateServiceAccountClick}
    />
  );
};

export { ServiceAccountsToolbar };
