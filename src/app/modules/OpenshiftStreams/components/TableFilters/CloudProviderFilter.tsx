import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
  Tooltip,
} from '@patternfly/react-core';
import { FilterProps } from '@app/modules/OpenshiftStreams/components/TableFilters/types';
import { cloudProviderOptions, KeyValueOptions } from '@app/utils';
import { useTooltipContent } from '@app/modules/OpenshiftStreams/components/TableFilters/hooks';

export type CloudProviderFilterProps = FilterProps;

export const CloudProviderFilter: React.FunctionComponent<CloudProviderFilterProps> =
  ({
    getSelectionForFilter,
    filterSelected,
    onDeleteChipGroup,
    onDeleteChip,
    updateFilter,
    isMaxFilter,
    removeFilterValue,
    isDisabledSelectOption,
  }) => {
    const { t } = useTranslation(['kasTemporaryFixMe']);

    const options: KeyValueOptions[] = cloudProviderOptions.map(
      (cloudProvider) => {
        return {
          label: t(cloudProvider.value),
          value: cloudProvider.value,
          disabled: false,
        };
      }
    );

    return (
      <ToolbarFilter
        chips={getSelectionForFilter('cloud_provider')?.map((val) => t(val))}
        deleteChip={(_category, chip) =>
          onDeleteChip && onDeleteChip('cloud_provider', chip, options)
        }
        deleteChipGroup={() =>
          onDeleteChipGroup && onDeleteChipGroup('cloud_provider')
        }
        categoryName={t('cloud_provider')}
        showToolbarItem={filterSelected === 'cloud_provider'}
      >
        <CloudProviderSelect
          updateFilter={updateFilter}
          isMaxFilter={isMaxFilter}
          removeFilterValue={removeFilterValue}
          isDisabledSelectOption={isDisabledSelectOption}
          options={options}
          getSelectionForFilter={getSelectionForFilter}
          filterSelected={filterSelected}
        />
      </ToolbarFilter>
    );
  };

type CloudProviderSelectProps = Pick<
  FilterProps,
  | 'updateFilter'
  | 'isMaxFilter'
  | 'removeFilterValue'
  | 'isDisabledSelectOption'
  | 'getSelectionForFilter'
  | 'filterSelected'
> & {
  options: KeyValueOptions[];
};

const CloudProviderSelect: React.FunctionComponent<CloudProviderSelectProps> =
  ({
    updateFilter,
    isMaxFilter,
    removeFilterValue,
    isDisabledSelectOption,
    options,
    getSelectionForFilter,
    filterSelected,
  }) => {
    const { t } = useTranslation(['kasTemporaryFixMe']);
    const selectRef = useRef<Select>(null);
    const tooltipContent = useTooltipContent(isMaxFilter);

    const FilterTooltip: React.FunctionComponent = () => {
      if (isMaxFilter) {
        return (
          <Tooltip
            isVisible={isMaxFilter}
            content={tooltipContent}
            reference={selectRef}
          />
        );
      }
      return <></>;
    };

    const [expanded, setExpanded] = useState(false);

    const onToggle = () => {
      setExpanded((prevState) => !prevState);
    };

    const onSelect = (
      _event:
        | React.MouseEvent<Element, MouseEvent>
        | React.ChangeEvent<Element>,
      selection: string | SelectOptionObject,
      isPlaceholder?: boolean | undefined
    ) => {
      if (isPlaceholder) clear();
      updateFilter(
        'cloud_provider',
        { value: selection.toString(), isExact: true },
        true
      );
      options.length < 2 && setExpanded(false);
    };

    const clear = () => {
      removeFilterValue && removeFilterValue('cloud_provider');
      setExpanded(false);
    };

    if (filterSelected === 'cloud_provider') {
      return (
        <Select
          id='cloud-provider-select'
          variant={SelectVariant.checkbox}
          aria-label='Select cloud provider'
          onToggle={onToggle}
          selections={getSelectionForFilter('cloud_provider')}
          isOpen={expanded}
          onSelect={onSelect}
          placeholderText={t('filter_by_cloud_provider')}
          className='select-custom-width'
          ref={selectRef}
        >
          {options.map((option, index) => {
            const isDisabled = () => {
              if (option.disabled) {
                return true;
              }
              return (
                isMaxFilter &&
                isDisabledSelectOption('cloud_provider', option.value)
              );
            };

            return (
              <SelectOption
                isDisabled={isDisabled()}
                key={index}
                value={option.value}
              >
                <FilterTooltip />
                {option.label}
              </SelectOption>
            );
          })}
        </Select>
      );
    }
    return <></>;
  };
