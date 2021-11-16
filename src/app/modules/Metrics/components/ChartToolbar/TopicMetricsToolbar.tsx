import React from "react";
import {
  Button,
  CardActions,
  CardHeader,
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
    onRefresh,
    onSetSelectedTopic,
  }) => {
    return (
      <>
        <CardHeader>
          <CardTitle component="h2">{title}</CardTitle>
          <CardActions>
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
                  disableToolbar={isDisabled}
                  keyText={"topic-metrics-time-filter"}
                />
                <Button variant="plain" aria-label="sync" onClick={onRefresh}>
                  <SyncIcon />
                </Button>
              </ToolbarContent>
            </Toolbar>
          </CardActions>
        </CardHeader>
        <Divider />
      </>
    );
  };
