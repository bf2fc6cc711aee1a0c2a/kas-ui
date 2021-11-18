import React from "react";
import { useTranslation } from "react-i18next";
import { ChartEmptyState } from "./ChartEmptyState";

export const MetricsUnavailableEmptyState = () => {
  const { t } = useTranslation();
  return (
    <ChartEmptyState
      title={t("metrics.empty_state_no_data_title")}
      body={t("metrics.empty_state_no_data_body")}
      noData
    />
  );
};
