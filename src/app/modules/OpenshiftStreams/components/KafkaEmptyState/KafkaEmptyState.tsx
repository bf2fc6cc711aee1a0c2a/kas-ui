import { FunctionComponent, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  QuickStartContext,
  QuickStartContextValues,
} from "@patternfly/quickstarts";
import { Button, ButtonVariant, PageSection } from "@patternfly/react-core";
import { MASEmptyState, MASEmptyStateVariant } from "@app/common";

export type KafkaEmptyStateProps = {
  handleCreateInstanceModal: () => void;
};
export const KafkaEmptyState: FunctionComponent<KafkaEmptyStateProps> = ({
  handleCreateInstanceModal,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const qsContext: QuickStartContextValues =
    useContext(QuickStartContext);
  return (
    <PageSection padding={{ default: "noPadding" }} isFilled>
      <MASEmptyState
        emptyStateProps={{
          variant: MASEmptyStateVariant.NoItems,
        }}
        emptyStateBodyProps={{
          body: (
            <>
              <Trans
                i18nKey="create_a_kafka_instance_to_get_started"
                ns={["kasTemporaryFixMe"]}
                components={[
                  <Button
                    variant={ButtonVariant.link}
                    isSmall
                    isInline
                    key="btn-quick-start"
                    onClick={() =>
                      qsContext.setActiveQuickStart &&
                      qsContext.setActiveQuickStart("getting-started")
                    }
                  />,
                ]}
              />
            </>
          ),
        }}
        titleProps={{ title: t("no_kafka_instances_yet") }}
      >
        <Button
          data-testid="emptyStateStreams-buttonCreateKafka"
          variant={ButtonVariant.primary}
          onClick={() =>
            handleCreateInstanceModal && handleCreateInstanceModal()
          }
          ouiaId="button-create"
        >
          {t("create_kafka_instance")}
        </Button>
      </MASEmptyState>
    </PageSection>
  );
};
