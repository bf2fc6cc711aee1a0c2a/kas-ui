import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  ToolbarFilter,
  Tooltip,
  ValidatedOptions,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import { ToolbarFilterItemProps } from '@app/common/ServiceTable/Toolbar/Filter';

export type TextInputFilterProps = ToolbarFilterItemProps & {
  getSelectionForFilter: (key: string) => string[];
  tooltipContent: (fieldName?: string) => React.ReactNode;
};

export const TextInputFilter: React.FunctionComponent<TextInputFilterProps> = ({
  isMaxFilter,
  updateFilter,
  filterItem,
  getSelectionForFilter,
  onDeleteChipGroup,
  onDeleteChip,
  tooltipContent,
}) => {
  const [value, setValue] = useState<string>('');
  const [valid, setValid] = useState<boolean>(true);

  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isInputValid = (value?: string) => {
    return value
      ? /^([a-zA-Z0-9-_%]*[a-zA-Z0-9-_%])?$/.test(value.trim())
      : true;
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter' && !isMaxFilter) {
      onTextFilter();
    }
  };

  const onChange = (input?: string) => {
    setValue(input || '');
    setValid(true);
  };

  const onTextFilter = () => {
    if (value.trim() != '') {
      if (isInputValid(value)) {
        updateFilter(filterItem.key, { value: value, isExact: false }, false);
        setValue('');
      } else {
        setValid(false);
      }
    }
  };

  return (
    <ToolbarFilter
      chips={getSelectionForFilter(filterItem.key)}
      deleteChip={(_category, chip) => onDeleteChip(filterItem.key, chip)}
      deleteChipGroup={() => onDeleteChipGroup(filterItem.key)}
      categoryName={t(filterItem.key)}
    >
      <InputGroup className='mk--filter-instances__toolbar--text-input'>
        <TextInput
          name={filterItem.key}
          id={`${filterItem.key}-text-filter`}
          type='search'
          aria-label={t(`filter_by_${filterItem.key}_aria_label`)}
          validated={
            !valid || isMaxFilter
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
          placeholder={t(`filter_by_${filterItem.key}_placeholder`)}
          onChange={onChange}
          onKeyPress={onKeyPress}
          value={value}
          ref={inputRef}
        />
        <Button
          variant={ButtonVariant.control}
          isDisabled={!valid || isMaxFilter}
          onClick={onTextFilter}
          aria-label='Search instances'
        >
          <SearchIcon />
        </Button>
        {(!valid || isMaxFilter) && (
          <Tooltip
            isVisible={isMaxFilter || !value}
            content={tooltipContent(filterItem.key)}
            reference={inputRef}
          />
        )}
      </InputGroup>
    </ToolbarFilter>
  );
};
