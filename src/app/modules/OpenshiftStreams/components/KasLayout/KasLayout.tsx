import {
  InstanceDrawer,
  InstanceDrawerProps,
} from "@app/modules/InstanceDrawer";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobileTablet } from "@app/utils";
import {
  Button,
  Level,
  LevelItem,
  Modal,
  ModalVariant,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
} from "@patternfly/react-core";

export type KasLayoutProps = Pick<InstanceDrawerProps, "tokenEndPointUrl">;

export const KasLayout: React.FunctionComponent<KasLayoutProps> = ({
  children,
  tokenEndPointUrl,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isMobileTablet()) {
      const localStorage = window.localStorage;
      if (localStorage) {
        const count = parseInt(localStorage.getItem("openSessions") || "0");
        const newCount = count + 1;
        if (count < 1) {
          localStorage.setItem("openSessions", `${newCount}`);
          setIsMobileModalOpen(true);
        }
      }
    }
  }, []);

  const handleMobileModal = () => {
    setIsMobileModalOpen(!isMobileModalOpen);
  };

  return (
    <>
      <InstanceDrawer
        tokenEndPointUrl={tokenEndPointUrl}
        renderContent={() => (
          <main className="pf-c-page__main">
            <PageSection variant={PageSectionVariants.light}>
              <Level>
                <LevelItem>
                  <TextContent>
                    <Text component="h1">{t("kafka_instances")}</Text>
                  </TextContent>
                </LevelItem>
              </Level>
            </PageSection>
            {children}
          </main>
        )}
      />
      <Modal
        variant={ModalVariant.small}
        title="Mobile experience"
        isOpen={isMobileModalOpen}
        onClose={() => handleMobileModal()}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => handleMobileModal()}
          >
            Ok
          </Button>,
        ]}
      >
        The mobile experience isn&apos;t fully optimized yet, so some items
        might not appear correctly.
      </Modal>
    </>
  );
};
