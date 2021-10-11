import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  Select,
  SelectVariant,
  Modal,
  Button,
  SelectOption,
  SelectOptionObject,
} from "@patternfly/react-core";
import { KafkaRequest } from "@rhoas/kafka-management-sdk";
import { Principal, usePrincipals } from "@rhoas/app-services-ui-shared";

export type TransferOwnershipProps = {
  kafka: KafkaRequest;
  onClose?: () => void;
  hideModal: () => void;
};

export const TransferOwnership: React.FC<TransferOwnershipProps> = ({
  kafka,
  onClose,
  hideModal,
}) => {
  const { t } = useTranslation();
  const { getAllUserAccounts } = usePrincipals() || {
    getAllUserAccounts: () => [],
  };
  const userAccounts = getAllUserAccounts();
  //states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selection, SetSelection] = useState();

  const handleToggle = () => {
    hideModal();
    onClose && onClose();
  };

  const onToggle = (isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };

  const clearSelection = () => {
    SetSelection(undefined);
    setIsOpen(false);
  };

  const onSlect = (
    _,
    selection: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    }
    SetSelection(selection);
    setIsOpen(false);
  };

  const onSubmitChangeOwner = () => {
    return;
  };

  return (
    <Modal
      id="manage-permissions-modal"
      title={t("change_owner")}
      isOpen={true}
      onClose={handleToggle}
      variant="medium"
      position="top"
      actions={[
        <Button
          key="changeowner"
          variant="primary"
          onClick={onSubmitChangeOwner}
        >
          Change owner
        </Button>,
        <Button key="cancel" variant="link" onClick={handleToggle}>
          Cancel
        </Button>,
      ]}
    >
      <Form>
        <FormGroup fieldId="Current-owner-name" label={t("current_owner_name")}>
          {kafka?.owner}
        </FormGroup>
        <FormGroup fieldId="New-owner-name" label={t("new_owner_name")}>
          <Select
            variant={SelectVariant.typeahead}
            onToggle={onToggle}
            isOpen={isOpen}
            placeholderText="Select user account"
            createText={"Use"}
            menuAppendTo="parent"
            maxHeight={400}
            onSelect={onSlect}
            selections={selection}
            isCreatable
          >
            {userAccounts?.map((userAccount: Principal) => {
              const { id, displayName } = userAccount;
              return (
                <SelectOption key={id} value={id} description={displayName}>
                  {id}
                </SelectOption>
              );
            })}
          </Select>
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default TransferOwnership;
