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
import { FilterIcon, SyncIcon } from '@patternfly/react-icons';

type ChartToolbarProps = {
  title: string;
  showTopicFilter: boolean;
  setTimeDuration: (value: number) => void;
  setTimeInterval: (value: number) => void;
  showTopicToolbar?: boolean;
  showKafkaToolbar?: boolean;
  setSelectedTopic?: (value: string) => void;
  selectedTopic?: string;
  onRefreshKafkaToolbar?: () => void;
  onRefreshTopicToolbar?: () => void;
  topicList?: string[];
  setIsFilterApplied?: (value: boolean) => void;
};
export const ChartToolbar = ({
  title,
  showTopicFilter,
  setTimeDuration,
  setTimeInterval,
  showKafkaToolbar = true,
  showTopicToolbar = true,
  setSelectedTopic,
  selectedTopic,
  onRefreshKafkaToolbar,
  onRefreshTopicToolbar,
  topicList,
  setIsFilterApplied,
}: ChartToolbarProps) => {
  const [selectedTime, setSelectedTime] = useState<boolean>(false);
  const [isTimeSelectOpen, setIsTimeSelectOpen] = useState<boolean>(false);
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);

  const onTimeToggle = (isTimeSelectOpen) => {
    setIsTimeSelectOpen(isTimeSelectOpen);
  };

  const onTimeSelect = (_, selection) => {
    setTimeDuration(formatTime(selection).timeDuration);
    setTimeInterval(formatTime(selection).timeInterval);
    setSelectedTime(selection);
    setIsTimeSelectOpen(false);
  };

  //Add a scalable logic to set duration and interval
  const formatTime = (selection: string) => {
    let timeDuration = 6;
    let timeInterval = 1 * 60; //in minutes
    switch (selection) {
      case 'Last 5 minutes':
        timeDuration = 5 / 60;
        timeInterval = 1;
        break;
      case 'Last 15 minutes':
        timeDuration = 15 / 60;
        timeInterval = 3;
        break;
      case 'Last 30 minutes':
        timeDuration = 30 / 60;
        timeInterval = 5;
        break;
      case 'Last 1 hour':
        timeDuration = 1;
        timeInterval = 10;
        break;
      case 'Last 3 hours':
        timeDuration = 3;
        timeInterval = 30;
        break;
      case 'Last 6 hours':
        timeDuration = 6;
        timeInterval = 1 * 60;
        break;
      case 'Last 12 hours':
        timeDuration = 12;
        timeInterval = 2 * 60;
        break;
      case 'Last 24 hours':
        timeDuration = 24;
        timeInterval = 4 * 60;
        break;
      case 'Last 2 days':
        timeDuration = 2 * 24;
        timeInterval = 8 * 60;
        break;
      case 'Last 7 days':
        timeDuration = 7 * 24;
        timeInterval = 24 * 60;
        break;
    }
    return { timeDuration, timeInterval };
  };

  const onTopicToggle = (isTopicSelectOpen) => {
    setIsTopicSelectOpen(isTopicSelectOpen);
  };

  const onTopicSelect = (_, selection) => {
    setSelectedTopic && setSelectedTopic(selection);
    setIsFilterApplied && (selection !== 'All topics' ? setIsFilterApplied(true) : setIsFilterApplied(false));
    setIsTopicSelectOpen(false);
  };

  const timeOptions = (keyText: string) => [
    <SelectGroup label="Relative time ranges" key={keyText + 'group1'}>
      <SelectOption key={keyText + 'time-filter' + 0} value="Last 5 minutes" />
      <SelectOption key={keyText + 'time-filter' + 1} value="Last 15 minutes" />
      <SelectOption key={keyText + 'time-filter' + 2} value="Last 30 minutes" />
      <SelectOption key={keyText + 'time-filter' + 3} value="Last 1 hour" />
      <SelectOption key={keyText + 'time-filter' + 4} value="Last 3 hours" />
      <SelectOption key={keyText + 'time-filter' + 5} value="Last 6 hours" />
      <SelectOption key={keyText + 'time-filter' + 6} value="Last 12 hours" />
      <SelectOption key={keyText + 'time-filter' + 7} value="Last 24 hours" />
      <SelectOption key={keyText + 'time-filter' + 8} value="Last 2 days" />
      <SelectOption key={keyText + 'time-filter' + 9} value="Last 7 days" />
    </SelectGroup>,
  ];

  const filterByTime = (disableToolbar: boolean, keyText: string) => {
    return (
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label="Select Input"
          onToggle={onTimeToggle}
          onSelect={onTimeSelect}
          selections={selectedTime}
          isOpen={isTimeSelectOpen}
          isDisabled={disableToolbar}
          placeholderText="Last 6 hours"
        >
          {timeOptions(keyText)}
        </Select>
      </ToolbarItem>
    );
  };

  const onTopicFilter = (_, textInput) => {
    const filteredTopics = topicList?.filter((topic) => topic === textInput) || [];
    return topicOptions(filteredTopics);
  };

  const topicOptions = (topicList) => [
    <>
      <SelectOption key={'topic-filter-' + 0} value="All topics" />
      <SelectGroup label="Filter by topic" key="group2">
        {topicList?.map((topic, index) => (
          <SelectOption key={`topic-filter-${index + 1}`} value={topic} />
        ))}
      </SelectGroup>
    </>,
  ];

  const filterByTopic = (disableToolbar: boolean) => {
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
          {topicOptions(topicList)}
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
                {filterByTime(!showTopicToolbar, 'topic-metrics')}
                <Button variant="plain" aria-label="sync" onClick={onRefreshTopicToolbar}>
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          ) : (
            <Toolbar>
              <ToolbarContent>
                {filterByTime(!showKafkaToolbar, 'kafka-metrics')}
                <Button variant="plain" aria-label="sync" onClick={onRefreshKafkaToolbar}>
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
