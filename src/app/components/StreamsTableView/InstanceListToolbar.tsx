import React, { useState } from 'react';
import {
  ToolbarItem,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
  Select,
  SelectVariant,
  SelectOption,
  ToolbarToggleGroup,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import './InstanceListToolbar.css';

type InstanceListToolbarProps = {
  createStreamsInstance: boolean;
  setCreateStreamsInstance: (createStreamsInstance: boolean) => void;
  mainToggle: boolean;
  filterSelected?: string;
};

const InstanceListToolbar: React.FunctionComponent<InstanceListToolbarProps> = ({
  createStreamsInstance,
  setCreateStreamsInstance,
  filterSelected = 'Name',
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>();

  const onFilterToggle = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  // options for filter dropdown
  const filterOptions = [{ value: 'Name', disabled: false }];

  const onInputChange = (input?: string) => {
    setInputValue(input);
  };

  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select filter"
          onToggle={onFilterToggle}
          selections={filterSelected}
          isOpen={isFilterExpanded}
        >
          {filterOptions.map((option, index) => (
            <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
          ))}
        </Select>
        <InputGroup className="filter-text-input">
          <TextInput
            name="filter text input"
            id="filterText"
            type="search"
            aria-label="Search filter input"
            placeholder={`Filter by ${filterSelected?.toLowerCase()}`}
            onChange={onInputChange}
            value={inputValue}
          />
          <Button variant={ButtonVariant.control} aria-label="Search instances">
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
    </>
  );

  const items = (
    <>
      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
        {toggleGroupItems}
      </ToolbarToggleGroup>

      <ToolbarItem>
        <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
          Create Streams instance
        </Button>
      </ToolbarItem>
    </>
  );

  return (
    <Toolbar id="instance-toolbar">
      <ToolbarContent>{items}</ToolbarContent>
    </Toolbar>
  );
};

export { InstanceListToolbar };
