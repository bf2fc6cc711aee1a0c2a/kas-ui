import { FC, MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  cellWidth,
  IAction,
  IRowData,
  ISeparator,
  ISortBy,
  OnSort,
  SortByDirection,
} from "@patternfly/react-table";
import { Skeleton } from "@patternfly/react-core";
import { MASEmptyState, MASEmptyStateVariant, MASTable } from "@app/common";
import {
  getFormattedDate,
  getLoadingRowsCount,
  getSkeletonForRows,
} from "@app/utils";
import { ServiceAccountListItem } from "@rhoas/kafka-management-sdk";
import {
  ServiceAccountsToolbar,
  ServiceAccountsToolbarProps,
} from "./ServiceAccountsToolbar";
import { useAuth } from "@rhoas/app-services-ui-shared";

export type ServiceAccountsTableViewProps = ServiceAccountsToolbarProps & {
  expectedTotal: number;
  serviceAccountsDataLoaded?: boolean;
  serviceAccountItems?: ServiceAccountListItem[];
  orderBy?: string;
  setOrderBy?: (order: string) => void;
  onResetCredentials?: (serviceAccount: ServiceAccountListItem) => void;
  onDeleteServiceAccount?: (serviceAccount: ServiceAccountListItem) => void;
  onCreateServiceAccount: () => void;
  page: number;
  perPage: number;
};

const ServiceAccountsTableView: FC<ServiceAccountsTableViewProps> = ({
  page,
  perPage,
  expectedTotal,
  serviceAccountsDataLoaded,
  serviceAccountItems,
  onResetCredentials,
  onDeleteServiceAccount,
  orderBy,
  setOrderBy,
  onCreateServiceAccount,
}: ServiceAccountsTableViewProps) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const auth = useAuth();

  const [loggedInUser, setLoggedInUser] = useState<string | undefined>(
    undefined
  );
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean>();

  useEffect(() => {
    auth?.getUsername()?.then((username) => setLoggedInUser(username));
  }, [auth]);

  useEffect(() => {
    auth?.isOrgAdmin()?.then((isOrgAdmin) => setIsOrgAdmin(isOrgAdmin));
  }, [auth]);

  const tableColumns = [
    { title: t("common.name") },
    { title: t("common.clientID") },
    { title: t("common.owner"), transforms: [cellWidth(20)] },
    { title: t("time_created") },
  ];

  const resetCredentials = (
    event: MouseEvent,
    originalData: ServiceAccountListItem
  ) => {
    onResetCredentials && onResetCredentials(originalData);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    event?.target?.parentElement?.parentElement?.previousSibling?.focus();
  };

  const deleteAccount = (
    event: MouseEvent,
    originalData: ServiceAccountListItem
  ) => {
    onDeleteServiceAccount && onDeleteServiceAccount(originalData);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    event?.target?.parentElement?.parentElement?.previousSibling?.focus();
  };

  const preparedTableCells = () => {
    const tableRow: (IRowData | string[])[] | undefined = [];
    const loadingCount: number = getLoadingRowsCount(
      page,
      perPage,
      expectedTotal
    );
    if (!serviceAccountsDataLoaded) {
      return getSkeletonForRows({
        loadingCount,
        skeleton: <Skeleton />,
        length: tableColumns.length,
      });
    }

    serviceAccountItems?.forEach((row: IRowData) => {
      const { name, owner, client_id, created_at } = row;
      tableRow.push({
        cells: [
          name,
          client_id,
          owner,
          { title: getFormattedDate(created_at, t("ago")) },
        ],
        originalData: row,
      });
    });
    return tableRow;
  };

  const buildActionResolver = (rowData: IRowData) => {
    if (!serviceAccountsDataLoaded) {
      return [];
    }

    const originalData: ServiceAccountListItem = rowData.originalData;
    const isUserSameAsLoggedIn =
      originalData.owner === loggedInUser || isOrgAdmin;
    let additionalProps: Partial<IAction> = {};

    if (!isUserSameAsLoggedIn) {
      additionalProps = {
        tooltip: true,
        isDisabled: true,
        style: {
          pointerEvents: "auto",
          cursor: "default",
        },
      };
    }

    const resolver: (IAction | ISeparator)[] = [
      {
        title: t("common.reset_credentials"),
        id: "reset-credentials",
        ["data-testid"]: "tableServiceAccounts-actionResetCredentials",
        onClick: (event) =>
          isUserSameAsLoggedIn && resetCredentials(event, originalData),
        ...additionalProps,
        tooltipProps: {
          position: "left",
          content: t("serviceAccount.no_permission_to_reset_service_account"),
        },
      } as IAction,
      {
        title: t("serviceAccount.delete_service_account"),
        id: "delete-account",
        ["data-testid"]: "tableServiceAccounts-actionDeleteAccount",
        onClick: (event) =>
          isUserSameAsLoggedIn && deleteAccount(event, originalData),
        ...additionalProps,
        tooltipProps: {
          position: "left",
          content: t("serviceAccount.no_permission_to_delete_service_account"),
        },
      } as IAction,
    ];
    return resolver;
  };

  const getParameterForSortIndex = (index: number) => {
    switch (index) {
      case 0:
        return "name";
      case 1:
        return "client_id";
      case 2:
        return "owner";
      case 3:
        return "description";
      case 4:
        return "created_at";
      default:
        return "";
    }
  };

  const getindexForSortParameter = (parameter: string) => {
    switch (parameter.toLowerCase()) {
      case "name":
        return 0;
      case "client_id":
        return 1;
      case "owner":
        return 2;
      case "description":
        return 3;
      case "created_at":
        return 4;
      default:
        return undefined;
    }
  };

  const onSort: OnSort = (_event, columnIndex, sortByDirection) => {
    setOrderBy &&
      setOrderBy(`${getParameterForSortIndex(columnIndex)} ${sortByDirection}`);
  };

  const sortBy = (): ISortBy | undefined => {
    const sort: string[] = orderBy?.split(" ") || [];
    if (sort.length > 1) {
      return {
        index: getindexForSortParameter(sort[0]),
        direction:
          sort[1] === SortByDirection.asc
            ? SortByDirection.asc
            : SortByDirection.desc,
      };
    }
    return;
  };

  return (
    <>
      <ServiceAccountsToolbar onCreateServiceAccount={onCreateServiceAccount} />
      <MASTable
        tableProps={{
          cells: tableColumns,
          rows: preparedTableCells(),
          "aria-label": t("serviceAccount.service_account_list"),
          actionResolver: (rowData) => buildActionResolver(rowData),
          onSort: onSort,
          sortBy: sortBy(),
        }}
      />
      {serviceAccountItems &&
        serviceAccountItems?.length < 1 &&
        serviceAccountsDataLoaded && (
          <MASEmptyState
            emptyStateProps={{
              variant: MASEmptyStateVariant.NoResult,
            }}
            titleProps={{
              title: t("no_results_found"),
            }}
            emptyStateBodyProps={{
              body: t("adjust_your_filters_and_try_again"),
            }}
          />
        )}
      {/* {total && total > 0 && (
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
      )} */}
    </>
  );
};

export { ServiceAccountsTableView };
