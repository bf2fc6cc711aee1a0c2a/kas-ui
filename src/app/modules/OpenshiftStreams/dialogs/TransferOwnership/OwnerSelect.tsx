import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {filterUsers} from './FilterOwners';
export type allUsersType={
  id:string,
  displayName:string|undefined
}[]|undefined
export type OwnerSelectProps={
    selection:string|undefined
    setSelection:(value:string|undefined)=>void
    allUsers:allUsersType
}

export const OwnerSelect: React.FC <OwnerSelectProps>= ({
  selection,
  setSelection,
  allUsers
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const options = allUsers && allUsers?.map((userAccount:{id,displayName}) => {
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
  const onSelect = (
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
  const customFilter = (_, value: string) => {
    return filterUsers(value,options);
    
  };
  return(
    <Select
      id='manage-permissions-owner-select'
      variant={SelectVariant.typeahead}
      onToggle={onToggle}
      isOpen={isOpen}
      placeholderText={t('select_user_account')}
      createText={t('common.use')}
      menuAppendTo='parent'
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