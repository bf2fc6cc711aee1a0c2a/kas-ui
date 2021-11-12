import { FilterProps } from '@app/modules/OpenshiftStreams/components/TableFilters/types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTooltipContent } from '@app/modules/OpenshiftStreams/components/TableFilters/hooks';
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

export type NameFilterProps = FilterProps;

export const NameFilter: React.FunctionComponent<NameFilterProps> = ({
  getSelectionForFilter,
  onDeleteChip,
  onDeleteChipGroup,
  filterSelected,
  isMaxFilter,
  updateFilter,
}) => {
  const { t } = useTranslation();
  const [valid, setValid] = useState<boolean>(true);
  const [value, setValue] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipContent = useTooltipContent(isMaxFilter, 'name');

  const change = (input?: string) => {
    setValue(input);
    !valid && setValid(true);
  };

  const validate = (value?: string) => {
    return value
      ? /^([a-zA-Z0-9-_%]*[a-zA-Z0-9-_%])?$/.test(value.trim())
      : true;
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter' && !isMaxFilter) {
      onFilter();
    }
  };

  const onFilter = () => {
    if (value && value.trim() != '') {
      if (validate(value)) {
        updateFilter('name', { value: value, isExact: false }, false);
        setValue('');
      } else {
        setValid(false);
      }
    }
  };

  const renderNameInput = () => {
    const v = !valid || isMaxFilter;
    const FilterTooltip: React.FunctionComponent = () => {
      if (v) {
        return (
          <Tooltip
            isVisible={isMaxFilter || !valid}
            content={tooltipContent}
            reference={inputRef}
          />
        );
      }
      return <></>;
    };

    if (filterSelected?.toLowerCase() === 'name') {
      return (
        <InputGroup>
          <TextInput
            name='name'
            id='filterText'
            type='search'
            aria-label='Search filter input'
            validated={v ? ValidatedOptions.error : ValidatedOptions.default}
            placeholder={t('filter_by_name_lower')}
            onChange={change}
            onKeyPress={onKeyPress}
            value={value}
            ref={inputRef}
          />
          <Button
            variant={ButtonVariant.control}
            isDisabled={!valid || isMaxFilter}
            onClick={() => onFilter()}
            aria-label='Search instances'
          >
            <SearchIcon />
          </Button>
          <FilterTooltip />
        </InputGroup>
      );
    }
    return <></>;
  };

  return (
    <ToolbarFilter
      chips={getSelectionForFilter('name')}
      deleteChip={(_category, chip) => onDeleteChip('name', chip)}
      deleteChipGroup={() => onDeleteChipGroup('name')}
      categoryName={t('name')}
      showToolbarItem={filterSelected?.toLowerCase() === 'name'}
    >
      {renderNameInput()}
    </ToolbarFilter>
  );
};
