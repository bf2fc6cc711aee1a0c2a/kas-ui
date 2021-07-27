import React, { useState } from 'react';
import {
  Button,
  CardTitle,
  Divider,
  Level,
  LevelItem,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';

type ChartToolbarProps = {
  title: string;
  showTopicFilter: boolean;
  setTimeInterval: (value: number) => void;
  showTopicToolbar?: boolean;
  showKafkaToolbar?: boolean;
  setSelectedTopic?: (value: boolean) => void;
  selectedTopic?: boolean;
};
export const ChartToolbar = ({
  title,
  showTopicFilter,
  setTimeInterval,
  showKafkaToolbar = true,
  showTopicToolbar = true,
  setSelectedTopic,
  selectedTopic,
}: ChartToolbarProps) => {
  const [selectedTime, setSelectedTime] = useState<boolean>(false);
  const [isTimeSelectOpen, setIsTimeSelectOpen] = useState<boolean>(false);
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);

  const onTimeToggle = (isTimeSelectOpen) => {
    setIsTimeSelectOpen(isTimeSelectOpen);
  };

  const onTimeSelect = (_, selection) => {
    setTimeInterval(formatTime(selection));
    setSelectedTime(selection);
    setIsTimeSelectOpen(false);
  };

  const formatTime = (selection: string) => {
    let timeInterval = 1;
    switch (selection) {
      case 'Last 1 hour':
        timeInterval = 1;
        break;
      case 'Last 2 hour':
        timeInterval = 2;
        break;
      case 'Last 4 hour':
        timeInterval = 4;
        break;
      case 'Last 6 hour':
        timeInterval = 6;
        break;
      case 'Last 12 hour':
        timeInterval = 12;
        break;
      case 'Last 24 hour':
        timeInterval = 24;
        break;
      case 'Last 2 days':
        timeInterval = 2 * 24;
        break;
      case 'Last 3 days':
        timeInterval = 3 * 24;
        break;
      case 'Last 4 days':
        timeInterval = 4 * 24;
        break;
      case 'Last 5 days':
        timeInterval = 5 * 24;
        break;
      case 'Last 6 days':
        timeInterval = 6 * 24;
        break;
      case 'Last 7 days':
        timeInterval = 7 * 24;
        break;
    }
    return timeInterval;
  };

  const onTopicToggle = (isTopicSelectOpen) => {
    setIsTopicSelectOpen(isTopicSelectOpen);
  };

  const onTopicSelect = (_, selection) => {
    setSelectedTopic && setSelectedTopic(selection);
    setIsTopicSelectOpen(false);
  };

  const filterByTime = (disableToolbar: boolean) => {
    return (
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select Input"
          onToggle={onTimeToggle}
          onSelect={onTimeSelect}
          selections={selectedTime}
          isOpen={isTimeSelectOpen}
          // isDisabled={disableToolbar}
          isDisabled
        >
          <SelectOption key={0} value="Last 1 hour" />
          <SelectOption key={1} value="Last 2 hour" />
          <SelectOption key={2} value="Last 4 hour" />
          <SelectOption key={3} value="Last 6 hour" isPlaceholder />
          <SelectOption key={4} value="Last 12 hour" />
          <SelectOption key={5} value="Last 24 hour" />
          <SelectOption key={6} value="Last 2 days" />
          <SelectOption key={7} value="Last 3 days" />
          <SelectOption key={8} value="Last 4 days" />
          <SelectOption key={9} value="Last 5 days" />
          <SelectOption key={10} value="Last 6 days" />
          <SelectOption key={11} value="Last 7 days" />
        </Select>
      </ToolbarItem>
    );
  };

  const onTopicFilter = (_, textInput) => {
    return topicOptions;
  };

  const topicOptions = [
    <SelectGroup label="Filter by topic" key="group1">
      <SelectOption key={0} value="topic-1" />
      <SelectOption key={1} value="topic-2" />
    </SelectGroup>,
  ];

  const filterByTopic = (disableToolbar: boolean) => {
    return (
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          onToggle={onTopicToggle}
          onSelect={onTopicSelect}
          selections={selectedTopic}
          isOpen={isTopicSelectOpen}
          placeholderText="All Topics"
          aria-labelledby={'titleId'}
          onFilter={onTopicFilter}
          isGrouped
          hasInlineFilter
          // isDisabled={disableToolbar}
          isDisabled
        >
          {topicOptions}
        </Select>
      </ToolbarItem>
    );
  };

  return (
    <>
      <Level>
        <LevelItem>
          <CardTitle component="h2">{title}</CardTitle>
        </LevelItem>
        <LevelItem>
          {showTopicFilter ? (
            <Toolbar>
              <ToolbarContent>
                {filterByTopic(!showTopicToolbar)}
                {filterByTime(!showTopicToolbar)}
                <Button variant="plain" aria-label="sync">
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          ) : (
            <Toolbar>
              <ToolbarContent>
                {filterByTime(!showKafkaToolbar)}
                <Button variant="plain" aria-label="sync">
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          )}
        </LevelItem>
      </Level>
      <Divider />
    </>
  );
};
