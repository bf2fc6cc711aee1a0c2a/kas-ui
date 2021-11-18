import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";
import { WrenchIcon } from "@patternfly/react-icons";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EmptyStateNoTopicsProps = {
  onCreateTopic: () => void;
};
export const EmptyStateNoTopics: FunctionComponent<EmptyStateNoTopicsProps> = ({
  onCreateTopic,
}) => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={WrenchIcon} />
      <Title headingLevel="h3" size="lg">
        {t("metrics.empty_state_no_topics_title")}
      </Title>
      <EmptyStateBody>{t("metrics.empty_state_no_topics_body")}</EmptyStateBody>
      <Button variant="primary" onClick={onCreateTopic}>
        {t("metrics.empty_state_no_topics_create_topic")}
      </Button>
    </EmptyState>
  );
};
