import { FC, useState } from "react";
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectProps,
  SelectVariant,
} from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { filterUsers } from "./FilterOwners";
export type allUsersType =
  | {
      id: string;
      displayName: string | undefined;
    }[]
  | undefined;
export type OwnerSelectProps = {
  selection: string | undefined;
  setSelection: (value: string | undefined) => void;
  allUsers: allUsersType;
};

export const OwnerSelect: FC<OwnerSelectProps> = ({
  selection,
  setSelection,
  allUsers,
}) => {
  const { t } = useTranslation(["kasTemporaryFixMe"]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const options = (allUsers || []).map((userAccount) => {
    const { id, displayName } = userAccount;
    return (
      <SelectOption key={id} value={id} description={displayName}>
        {id}
      </SelectOption>
    );
  });
  const onToggle = (isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };
  const onSelect: SelectProps["onSelect"] = (
    _,
    selection: string | SelectOptionObject,
    isPlaceholder: boolean | undefined
  ) => {
    if (isPlaceholder) {
      clearSelection();
    }
    setSelection(selection.toString());
    setIsOpen(false);
  };
  const clearSelection = () => {
    setSelection(undefined);
    setIsOpen(false);
  };
  const customFilter: SelectProps["onFilter"] = (_, value: string) => {
    return filterUsers(value, options);
  };
  return (
    <Select
      id="manage-permissions-owner-select"
      variant={SelectVariant.typeahead}
      onToggle={onToggle}
      isOpen={isOpen}
      placeholderText={t("select_user_account")}
      createText={t("common.use")}
      menuAppendTo="parent"
      maxHeight={400}
      onSelect={onSelect}
      selections={selection}
      isCreatable
      onFilter={customFilter}
    >
      {options}
    </Select>
  );
};
