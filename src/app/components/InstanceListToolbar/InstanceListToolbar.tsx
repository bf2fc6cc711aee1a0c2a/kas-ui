import React, { useState } from 'react';
import {
  ToolbarItem,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
  ToolbarGroup,
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
  mainToggle,
  createStreamsInstance,
  setCreateStreamsInstance,
  filterSelected = 'Name',
}) => {
  const [isFilterExpanded, setIsFitlerExpanded] = useState(false);
	const [inputData, setInputData] = useState<string | undefined>();
	
  const onFilterToggle = () => {
    setIsFitlerExpanded(!isFilterExpanded);
	};
	
	// options for filter dropdown
  const filterOptions = [
    { value: 'Name', disabled: false, isPlaceholder: true },
    { value: 'Status', disabled: true },
  ];
	
	const onInputChange = (input?: string) => {
    setInputData(input);
  };

  const toggleGroupItems = (
    <>
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select Filter"
          onToggle={onFilterToggle}
          selections={filterSelected}
          isOpen={isFilterExpanded}
        >
          {filterOptions.map((option, index) => (
            <SelectOption isDisabled={option.disabled} key={index} value={option.value} />
          ))}
        </Select>
        <InputGroup>
          <TextInput
            name="filter text input"
            id="filterText"
            type="search"
						aria-label="search filter input"
						//TODO: manage palceholder based on selected filter
            placeholder={filterSelected === 'Name' ? 'Filter by name' : ''}
            onChange={onInputChange}
            value={inputData}
          />
          <Button variant={ButtonVariant.control} aria-label="search button for search input">
            <SearchIcon />
          </Button>
        </InputGroup>
      </ToolbarItem>
      <ToolbarItem>
        <Button variant="primary" onClick={() => setCreateStreamsInstance(!createStreamsInstance)}>
          Create Streams Instance
        </Button>
      </ToolbarItem>
    </>
  );

  const items = (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      {toggleGroupItems}
    </ToolbarToggleGroup>
  );

  return (
    <Toolbar id="instance-toolbar">
      <ToolbarContent>{items}</ToolbarContent>
    </Toolbar>
  );
};

export { InstanceListToolbar };
