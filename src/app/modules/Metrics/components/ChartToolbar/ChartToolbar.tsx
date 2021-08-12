import React from 'react';
import { Button, CardTitle, Divider, Level, LevelItem, Toolbar, ToolbarContent } from '@patternfly/react-core';
import { SyncIcon } from '@patternfly/react-icons';
import { FilterByTopic } from './FilterByTopic';
import { FilterByTime } from './FilterByTime';

type ChartToolbarProps = {
  title: string;
  showTopicFilter: boolean;
  setTimeDuration: (value: number) => void;
  setTimeInterval: (value: number) => void;
  showTopicToolbar?: boolean;
  showKafkaToolbar?: boolean;
  setSelectedTopic?: (value: string | boolean) => void;
  selectedTopic?: string | boolean;
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
                <FilterByTopic
                  selectedTopic={selectedTopic}
                  setSelectedTopic={setSelectedTopic}
                  topicList={topicList}
                  setIsFilterApplied={setIsFilterApplied}
                  disableToolbar={!showTopicToolbar}
                />
                <FilterByTime
                  setTimeDuration={setTimeDuration}
                  setTimeInterval={setTimeInterval}
                  disableToolbar={!showTopicToolbar}
                  keyText={'topic-metrics'}
                />
                <Button variant="plain" aria-label="sync" onClick={onRefreshTopicToolbar}>
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          ) : (
            <Toolbar>
              <ToolbarContent>
                <FilterByTime
                  setTimeDuration={setTimeDuration}
                  setTimeInterval={setTimeInterval}
                  keyText={'kafka-metrics'}
                  disableToolbar={!showKafkaToolbar}
                />
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
