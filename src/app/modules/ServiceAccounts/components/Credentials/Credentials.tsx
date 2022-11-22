import { FunctionComponent, useState } from "react";
import {
  Bullseye,
  Button,
  Checkbox,
  ClipboardCopy,
  EmptyStateVariant,
  InputGroup,
  InputGroupText,
  Text,
  TextContent,
  TextVariants,
  TitleSizes,
} from "@patternfly/react-core";
import KeyIcon from "@patternfly/react-icons/dist/js/icons/key-icon";
import "@patternfly/react-styles/css/utilities/Spacing/spacing.css";
import "@patternfly/react-styles/css/utilities/Flex/flex.css";
import "@patternfly/react-styles/css/utilities/Sizing/sizing.css";
import { useTranslation } from "react-i18next";
import { MASEmptyState } from "@app/common";
import "./Credentials.css";
import { ServiceAccountData } from "@rhoas/service-accounts-sdk";

type CredentialsProps = {
  serviceAccount: ServiceAccountData;
  close: () => void;
};

const Credentials: FunctionComponent<CredentialsProps> = ({
  serviceAccount,
  close,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);

  const [confirmationCheckbox, setConfirmationCheckbox] = useState(false);

  const confirm = (checked: boolean) => {
    setConfirmationCheckbox(checked);
  };

  return (
    <>
      <MASEmptyState
        emptyStateProps={{
          variant: EmptyStateVariant.large,
        }}
        emptyStateIconProps={{
          icon: KeyIcon,
        }}
        titleProps={{
          title: t("credentials_successfully_generated"),
          headingLevel: "h2",
          size: TitleSizes.lg,
        }}
      >
        <TextContent>
          <Text component={TextVariants.small} className="pf-u-mt-lg">
            {t("connect_to_the_kafka_instance_using_this_clientID_and_secret")}
          </Text>
        </TextContent>
        <InputGroup className="pf-u-mt-lg">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">
            {t("client_id")}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className="pf-u-w-100"
            data-testid="modalCredentials-copyClientID"
            data-ouia-component-id={"button-copy-clientID"}
            textAriaLabel={t("client_id")}
          >
            {serviceAccount?.clientId}
          </ClipboardCopy>
        </InputGroup>
        <InputGroup className="pf-u-mt-md">
          <InputGroupText className="mk--generate-credential__empty-state--input-group">
            {t("common.client_secret")}
          </InputGroupText>
          <ClipboardCopy
            isReadOnly
            className="pf-u-w-100"
            data-testid="modalCredentials-copyClientSecret"
            data-ouia-component-id={"button-copy-clientSecret"}
            textAriaLabel={t("common.client_secret")}
          >
            {serviceAccount?.secret}
          </ClipboardCopy>
        </InputGroup>
        <TextContent>
          <Text component={TextVariants.small} className="pf-u-mt-lg">
            {t("create_service_account_credentials_warning_message")}
          </Text>
        </TextContent>
        <Bullseye className="pf-u-mt-lg">
          <Checkbox
            label={t("client_id_confirmation_checkbox_label")}
            isChecked={confirmationCheckbox}
            onChange={confirm}
            id="check-1"
            name="check1"
            ouiaId={"checkbox"}
          />
        </Bullseye>
        <Button
          variant="primary"
          isDisabled={!confirmationCheckbox}
          onClick={close}
          data-testid="modalCredentials-buttonClose"
          ouiaId={"button-close"}
        >
          {t("close")}
        </Button>
      </MASEmptyState>
    </>
  );
};

export { Credentials };

export default Credentials;
