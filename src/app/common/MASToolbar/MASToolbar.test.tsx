import React from 'react';
import { render, screen, cleanup, act } from '@testing-library/react';
import {
  Button,
  ToolbarGroup,
  ToolbarItem,
  Select,
  SelectOption,
  SelectVariant,
  ToolbarFilter,
  InputGroup,
  TextInput,
  ButtonVariant,
} from '@patternfly/react-core';
import { MASToolbar, MASToolbarProps, ToolbarItemProps } from './MASToolbar';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import userEvent from '@testing-library/user-event';

afterEach(cleanup);

describe('<MASToolbar/>', () => {
  it('should render MASToolbar', () => {
    //arrange
    const mainFilterOptions = [
      { label: 'Name', value: 'name', disabled: false },
      { label: 'Cloud Provider', value: 'cloud_provider', disabled: false },
      { label: 'Region', value: 'region', disabled: false },
      { label: 'Owner', value: 'owner', disabled: false },
      { label: 'Status', value: 'status', disabled: false },
    ];

    const onClear = jest.fn();
    const setIsModalOpen = jest.fn();
    const onFilterToggle = jest.fn();
    const filterSelected = 'name';
    const isFilterExpanded = true;
    const onChangeSelect = jest.fn();
    const getSelectionForFilter = jest.fn();
    const onDeleteChip = jest.fn();
    const onDeleteChipGroup = jest.fn();
    const onNameInputChange = jest.fn();
    const onInputPress = jest.fn();
    const onFilter = jest.fn();
    const nameInputValue = 'name';

    const toggleGroupItems = (
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <Select
            variant={SelectVariant.single}
            aria-label="Select filter"
            onToggle={onFilterToggle}
            selections={filterSelected}
            isOpen={isFilterExpanded}
            onSelect={onChangeSelect}
          >
            {mainFilterOptions.map((option, index) => (
              <SelectOption isDisabled={option.disabled} key={index} value={option.value}>
                {option.label}
              </SelectOption>
            ))}
          </Select>
        </ToolbarItem>
        <ToolbarFilter
          chips={getSelectionForFilter('name')}
          deleteChip={(_category, chip) => onDeleteChip('name', chip)}
          deleteChipGroup={() => onDeleteChipGroup('name')}
          categoryName={'Name'}
        >
          <ToolbarItem>
            <InputGroup className="mk--filter-instances__toolbar--text-input">
              <TextInput
                name="name"
                id="filterText"
                type="search"
                aria-label="Search filter input"
                placeholder={'Filter by name'}
                onChange={onNameInputChange}
                onKeyPress={onInputPress}
                value={nameInputValue}
              />
              <Button variant={ButtonVariant.control} onClick={() => onFilter('name')} aria-label="Search instances">
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
        </ToolbarFilter>
      </ToolbarGroup>
    );

    const toolbarItems: ToolbarItemProps[] = [
      {
        item: (
          <Button variant="primary" onClick={setIsModalOpen}>
            Create kafka instance
          </Button>
        ),
      },
    ];

    const props: MASToolbarProps = {
      toolbarProps: {
        id: 'instance-toolbar',
        clearAllFilters: onClear,
        collapseListedFiltersBreakpoint: 'md',
        inset: { lg: 'insetLg' },
      },
      toggleGroupProps: { toggleIcon: <FilterIcon />, breakpoint: 'md' },
      toggleGroupItems,
      toolbarItems,
    };

    render(<MASToolbar {...props} />);

    //act
    act(() => {
      const createButton: any = screen.getByRole('button', { name: /Create kafka instance/i });
      userEvent.click(createButton);
      const filterSelect: any = screen.getByRole('listbox', { name: /Select filter/i });
      userEvent.click(filterSelect);
      const searchButton: any = screen.getByRole('button', { name: /Search instances/i });
      userEvent.click(searchButton);
    });

    //assert
    expect(setIsModalOpen).toHaveBeenCalled();
    expect(onFilterToggle).toHaveBeenCalled();
    expect(onFilter).toHaveBeenCalled();
    //check dropdown options
    screen.getAllByText(/name/i);
    screen.getAllByText(/status/i);
    //input field
    const nameInput: any = screen.getByRole('searchbox', { name: /Search filter input/i });
    expect(nameInput).toHaveValue('name');
  });
});
