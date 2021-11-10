import React, { useState } from 'react';
import {
  ToolbarItem,
  Select,
  SelectVariant,
  SelectGroup,
  SelectOption,
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

const widths = {
  default: '100px',
  sm: '80px',
  md: '150px',
  lg: '200px',
  xl: '250px',
  '2xl': '300px',
};

type FilterByTopicProps = {
  selectedTopic: string | undefined;
  topicList: string[];
  disableToolbar: boolean;
  onSetSelectedTopic: (value: string | undefined) => void;
};

export const FilterByTopic = ({
  selectedTopic,
  topicList = [],
  disableToolbar,
  onSetSelectedTopic,
}: FilterByTopicProps) => {
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);

  const onTopicToggle = (isTopicSelectOpen) => {
    setIsTopicSelectOpen(isTopicSelectOpen);
  };

  const onTopicSelect = (_, selection) => {
    selection !== 'All topics'
      ? onSetSelectedTopic(selection)
      : onSetSelectedTopic(undefined);
  };

  const onTopicFilter = (_, textInput) => {
    const filteredTopics =
      topicList.filter((topic) => topic.indexOf(textInput) != -1) || [];
    return topicOptions(filteredTopics);
  };

  const topicOptions = (topicList) => [
    <SelectOption key={'topic-filter-0'} value='All topics' />,
    <SelectGroup label='Filter by topic' key='topic-filter-group'>
      {topicList.map((topic, index) => (
        <SelectOption key={`topic-filter-${index + 1}`} value={topic} />
      ))}
    </SelectGroup>,
  ];

  const isDisabled = disableToolbar || topicList.length === 0;

  return (
    <ToolbarItem widths={widths}>
      <Select
        variant={SelectVariant.single}
        onToggle={onTopicToggle}
        onSelect={onTopicSelect}
        selections={selectedTopic}
        isOpen={isTopicSelectOpen}
        placeholderText={
          <>
            <FilterIcon /> All topics
          </>
        }
        aria-labelledby={'titleId'}
        onFilter={onTopicFilter}
        isGrouped
        hasInlineFilter
        isDisabled={isDisabled}
        style={{ width: '100%' }}
      >
        {topicOptions(topicList)}
      </Select>
    </ToolbarItem>
  );
};
