import React, { useEffect, useState } from 'react';
import { ToolbarItem, Select, SelectVariant, SelectGroup, SelectOption } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

type FilterByTopicProps = {
  setSelectedTopic?: (value: string | boolean) => void;
  selectedTopic?: string | boolean;
  topicList?: string[];
  setIsFilterApplied?: (value: boolean) => void;
  disableToolbar: boolean;
};

export const FilterByTopic = ({
  selectedTopic,
  setSelectedTopic,
  topicList,
  setIsFilterApplied,
  disableToolbar,
}: FilterByTopicProps) => {
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);
  const [topicListFinal, setTopicListFinal] = useState<string[]>();

  useEffect(() => {
    topicList && setTopicListFinal(topicList);
  }, [topicList]);

  const onTopicToggle = (isTopicSelectOpen) => {
    setIsTopicSelectOpen(isTopicSelectOpen);
  };

  const onTopicSelect = (_, selection) => {
    setSelectedTopic && setSelectedTopic(selection);
    setIsFilterApplied && (selection !== 'All topics' ? setIsFilterApplied(true) : setIsFilterApplied(false));
    setIsTopicSelectOpen(false);
  };

  const onTopicFilter = (_, textInput) => {
    const filteredTopics = topicListFinal?.filter((topic) => topic.indexOf(textInput) != -1) || [];
    return topicOptions(filteredTopics);
  };

  const topicOptions = (topicList) => [
    <>
      <SelectOption key={'topic-filter-' + 0} value="All topics" />
      <SelectGroup label="Filter by topic" key="topic-filter-group">
        {topicList?.map((topic, index) => (
          <SelectOption key={`topic-filter-${index + 1}`} value={topic} />
        ))}
      </SelectGroup>
    </>,
  ];

  const widths = {
    default: '100px',
    sm: '80px',
    md: '150px',
    lg: '200px',
    xl: '250px',
    '2xl': '300px',
  };
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
        isDisabled={disableToolbar}
        style={{ width: '100%' }}
      >
        {topicOptions(topicListFinal)}
      </Select>
    </ToolbarItem>
  );
};
