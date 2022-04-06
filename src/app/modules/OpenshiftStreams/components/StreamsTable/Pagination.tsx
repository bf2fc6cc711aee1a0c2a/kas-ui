import React from "react";
import { useTranslation } from "react-i18next";
import { MASPagination } from "@app/common";
import { PaginationVariant } from "@patternfly/react-core";

export type PaginationProps = {
  total: number;
  page: number;
  perPage: number;
};

export const Pagination: React.FunctionComponent<PaginationProps> = ({
  total,
  page,
  perPage,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  if (total > 0) {
    return (
      <MASPagination
        widgetId="pagination-cloudProviderOptions-menu-bottom"
        itemCount={total}
        variant={PaginationVariant.bottom}
        page={page}
        perPage={perPage}
        titles={{
          paginationTitle: t("full_pagination"),
          perPageSuffix: t("per_page_suffix"),
          toFirstPage: t("to_first_page"),
          toPreviousPage: t("to_previous_page"),
          toLastPage: t("to_last_page"),
          toNextPage: t("to_next_page"),
          optionsToggle: t("options_toggle"),
          currPage: t("curr_page"),
        }}
      />
    );
  }
  return <></>;
};
