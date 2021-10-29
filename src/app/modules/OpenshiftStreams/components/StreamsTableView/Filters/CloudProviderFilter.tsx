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
import { cloudProviderOptions } from '@app/utils';
import { FilterProps } from '@app/modules/OpenshiftStreams/components/StreamsTableView/Filters/types';
import { useTooltipContent } from '@app/modules/OpenshiftStreams/components/StreamsTableView/Filters/hooks';

export type CloudProviderFilterProps = FilterProps;

export const CloudProviderFilter: React.FunctionComponent<CloudProviderFilterProps> =
  ({
    getSelectionForFilter,
    filterSelected,
    isMaxFilter,
    updateFilter,
    removeFilterValue,
    isDisabledSelectOption,
    onDeleteChipGroup,
    onDeleteChip,
  }) => {
    const { t } = useTranslation();
    const selectRef = useRef<Select>(null);
    const tooltipContent = useTooltipContent(isMaxFilter);

    const options = cloudProviderOptions.map((cloudProvider) => {
      return {
        label: t(cloudProvider.value),
        value: cloudProvider.value,
        disabled: false,
      };
    });

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

    const CloudProviderSelect: React.FunctionComponent = () => {
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
        removeFilterValue('cloud_provider');
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

    return (
      <ToolbarFilter
        chips={getSelectionForFilter('cloud_provider')?.map((val) => t(val))}
        deleteChip={(_category, chip) =>
          onDeleteChip('cloud_provider', chip, options)
        }
        deleteChipGroup={() => onDeleteChipGroup('cloud_provider')}
        categoryName={t('cloud_provider')}
        showToolbarItem={filterSelected === 'cloud_provider'}
      >
        <CloudProviderSelect />
      </ToolbarFilter>
    );
  };
