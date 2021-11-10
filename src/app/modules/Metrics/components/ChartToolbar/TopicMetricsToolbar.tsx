import React from "react";
import {
  Button,
  CardTitle,
  Divider,
  Level,
  LevelItem,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import SyncIcon from "@patternfly/react-icons/dist/js/icons/sync-icon";
import { FilterByTopic } from "./FilterByTopic";
import { FilterByTime } from "./FilterByTime";
import { FunctionComponent } from "enzyme";

type TopicMetricsToolbarProps = {
  title: string;
  selectedTopic: string | undefined;
  topicList: string[];
  isDisabled: boolean;
  onSetTimeDuration: (value: number) => void;
  onSetTimeInterval: (value: number) => void;
  onSetSelectedTopic: (value: string | undefined) => void;
  onRefresh: () => void;
};
export const TopicMetricsToolbar: FunctionComponent<TopicMetricsToolbarProps> =
  ({
    title,
    selectedTopic,
    topicList,
    isDisabled,
    onSetTimeDuration,
    onSetTimeInterval,
    onRefresh,
    onSetSelectedTopic,
  }) => {
    return (
      <>
        <Level>
          <LevelItem>
            <CardTitle component="h2">{title}</CardTitle>
          </LevelItem>
          <LevelItem>
            <Toolbar>
              <ToolbarContent>
                <FilterByTopic
                  selectedTopic={selectedTopic}
                  onSetSelectedTopic={onSetSelectedTopic}
                  topicList={topicList}
                  disableToolbar={isDisabled}
                />
                <FilterByTime
                  setTimeDuration={onSetTimeDuration}
                  setTimeInterval={onSetTimeInterval}
                  disableToolbar={isDisabled}
                  keyText={"topic-metrics-time-filter"}
                />
                <Button variant="plain" aria-label="sync" onClick={onRefresh}>
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          </LevelItem>
        </Level>
        <Divider />
      </>
    );
  };
