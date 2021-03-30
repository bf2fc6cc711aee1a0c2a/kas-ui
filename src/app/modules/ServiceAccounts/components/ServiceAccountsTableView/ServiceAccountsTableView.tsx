import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IAction,
  IExtraData,
  IRowData,
  ISeparator,
  IRowCell,
  sortable,
  ISortBy,
  SortByDirection,
  IExtraColumnData,
  cellWidth,
} from '@patternfly/react-table';
import { Skeleton, EmptyStateVariant, PaginationVariant, TitleSizes } from '@patternfly/react-core';
import { MASPagination, MASTable, MASEmptyState } from '@app/common';
import { getLoadingRowsCount } from '@app/utils';
import { DefaultApi, ServiceAccountRequest, ServiceAccountListItem } from '../../../../../openapi/api';
import { ServiceAccountsToolbar, ServiceAccountsToolbarProps } from './ServiceAccountsToolbar';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

export type ServiceAccountsTableViewProps = ServiceAccountsToolbarProps & {
  expectedTotal: number;
  serviceAccountsDataLoaded?: boolean;
  serviceAccountItems?: ServiceAccountListItem[];
  orderBy?: string;
  setOrderBy?: (order: string) => void;
  onResetCredentials?: (serviceAccount: ServiceAccountListItem) => void;
  onDeleteServiceAccount?: (serviceAccount: ServiceAccountListItem) => void;
  handleCreateModal: () => void;
};

const ServiceAccountsTableView: React.FC<ServiceAccountsTableViewProps> = ({
  page,
  perPage,
  expectedTotal,
  total,
  serviceAccountsDataLoaded,
  serviceAccountItems,
  onResetCredentials,
  onDeleteServiceAccount,
  orderBy,
  setOrderBy,
  filteredValue,
  setFilteredValue,
  filterSelected,
  setFilterSelected,
  handleCreateModal,
}: ServiceAccountsTableViewProps) => {
  const { t } = useTranslation();

  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(undefined);

  const tableColumns = [
    { title: t('common.name'), transforms: [sortable] },
    { title: t('common.clientID'), transforms: [sortable] },
    { title: t('common.owner'), transforms: [sortable, cellWidth(20)] },
    { title: t('common.description') },
  ];

  const onSelectKebabDropdownOption = (event: any, originalData: ServiceAccountListItem, selectedOption: string) => {
    if (selectedOption === 'reset-credentials') {
      onResetCredentials && onResetCredentials(originalData);
    } else if (selectedOption === 'delete-account') {
      onDeleteServiceAccount && onDeleteServiceAccount(originalData);
    }

    // Set focus back on previous selected element i.e. kebab button
    event?.target?.parentElement?.parentElement?.previousSibling?.focus();
  };

  const preparedTableCells = () => {
    const tableRow: (IRowData | string[])[] | undefined = [];
    const loadingCount: number = getLoadingRowsCount(page, perPage, expectedTotal);
    if (!serviceAccountsDataLoaded) {
      // for loading state
      const cells: (React.ReactNode | IRowCell)[] = [];
      //get exact number of skeleton cells based on total columns
      for (let i = 0; i < tableColumns.length; i++) {
        cells.push({ title: <Skeleton /> });
      }
      // get exact of skeleton rows based on expected total count of instances
      for (let i = 0; i < loadingCount; i++) {
        tableRow.push({
          cells: cells,
        });
      }
      return tableRow;
    }

    serviceAccountItems?.forEach((row: IRowData) => {
      const { name, owner = 'owner-test', description, clientID } = row;
      tableRow.push({
        cells: [name, clientID, owner, description],
        originalData: row,
      });
    });
    return tableRow;
  };

  const getActionResolver = (rowData: IRowData, extraData: IExtraData) => {
    if (!serviceAccountsDataLoaded) {
      return [];
    }

    const originalData: ServiceAccountListItem = rowData.originalData;
    const isUserSameAsLoggedIn = true; //originalData.owner === loggedInUser;
    let additionalProps: any;

    if (!isUserSameAsLoggedIn) {
      additionalProps = {
        tooltip: true,
        tooltipProps: {
          position: 'left',
          content: t('serviceAccount.no_permission_to_delete_service_account'),
        },
        isDisabled: true,
        style: {
          pointerEvents: 'auto',
          cursor: 'default',
        },
      };
    }

    const resolver: (IAction | ISeparator)[] = [
      {
        title: t('common.reset_credentials'),
        id: 'reset-credentials',
        ['data-testid']: 'tableServiceAccounts-actionResetCredentials',
        onClick: (event: any) => onSelectKebabDropdownOption(event, originalData, 'reset-credentials'),
      },
      {
        title: t('serviceAccount.delete_service_account'),
        id: 'delete-account',
        ['data-testid']: 'tableServiceAccounts-actionDeleteAccount',
        onClick: (event: any) =>
          isUserSameAsLoggedIn && onSelectKebabDropdownOption(event, originalData, 'delete-account'),
        ...additionalProps,
      },
    ];
    return resolver;
  };

  const actionResolver = (rowData: IRowData, _extraData: IExtraData) => {
    return getActionResolver(rowData, _extraData);
  };

  const getParameterForSortIndex = (index: number) => {
    switch (index) {
      case 0:
        return 'name';
      case 1:
        return 'owner';
      case 2:
        return 'description';
      default:
        return '';
    }
  };

  const getindexForSortParameter = (parameter: string) => {
    switch (parameter.toLowerCase()) {
      case 'name':
        return 0;
      case 'owner':
        return 1;
      case 'description':
        return 2;
      default:
        return undefined;
    }
  };

  const onSort = (_event: any, columnIndex: number, sortByDirection: SortByDirection, extraData: IExtraColumnData) => {
    setOrderBy && setOrderBy(`${getParameterForSortIndex(columnIndex)} ${sortByDirection}`);
  };

  const sortBy = (): ISortBy | undefined => {
    const sort: string[] = orderBy?.split(' ') || [];
    if (sort.length > 1) {
      return {
        index: getindexForSortParameter(sort[0]),
        direction: sort[1] === SortByDirection.asc ? SortByDirection.asc : SortByDirection.desc,
      };
    }
    return;
  };

  return (
    <>
      <ServiceAccountsToolbar
        filterSelected={filterSelected}
        setFilterSelected={setFilterSelected}
        total={total}
        page={page}
        perPage={perPage}
        filteredValue={filteredValue}
        setFilteredValue={setFilteredValue}
        handleCreateModal={handleCreateModal}
      />
      <MASTable
        tableProps={{
          cells: tableColumns,
          rows: preparedTableCells(),
          'aria-label': t('serviceAccount.service_account_list'),
          actionResolver: actionResolver,
          onSort: onSort,
          sortBy: sortBy(),
        }}
      />
      {serviceAccountItems && serviceAccountItems?.length < 1 && serviceAccountsDataLoaded && (
        <MASEmptyState
          emptyStateProps={{
            variant: EmptyStateVariant.full,
          }}
          emptyStateIconProps={{
            icon: SearchIcon,
          }}
          titleProps={{
            title: t('no_results_found'),
            headingLevel: 'h2',
            size: TitleSizes.lg,
          }}
          emptyStateBodyProps={{
            body: t('adjust_your_filters_and_try_again'),
          }}
        />
      )}
      {total && total > 0 && (
        <MASPagination
          widgetId="pagination-options-menu-bottom"
          itemCount={total}
          variant={PaginationVariant.bottom}
          page={page}
          perPage={perPage}
          titles={{
            paginationTitle: t('full_pagination'),
            perPageSuffix: t('per_page_suffix'),
            toFirstPage: t('to_first_page'),
            toPreviousPage: t('to_previous_page'),
            toLastPage: t('to_last_page'),
            toNextPage: t('to_next_page'),
            optionsToggle: t('options_toggle'),
            currPage: t('curr_page'),
          }}
        />
      )}
    </>
  );
};

export { ServiceAccountsTableView };
