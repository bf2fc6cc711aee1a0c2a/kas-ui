import {
  Button,
  CardActions,
  CardHeader,
  CardTitle,
  Divider,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import SyncIcon from "@patternfly/react-icons/dist/js/icons/sync-icon";
import React, { FunctionComponent } from "react";
import { DurationOptions, FilterByTime } from "./FilterByTime";
import { FilterByTopic } from "./FilterByTopic";

type ToolbarTopicsMetricsProps = {
  title: string;
  selectedTopic: string | undefined;
  topicList: string[];
  timeDuration: DurationOptions;
  isDisabled: boolean;
  isRefreshing: boolean;
  onSetTimeDuration: (value: DurationOptions) => void;
  onSetSelectedTopic: (value: string | undefined) => void;
  onRefresh: () => void;
};
export const ToolbarTopicsMetrics: FunctionComponent<ToolbarTopicsMetricsProps> =
  ({
    title,
    selectedTopic,
    topicList,
    timeDuration,
    isDisabled,
    isRefreshing,
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
                  timeDuration={timeDuration}
                  onDurationChange={onSetTimeDuration}
                  disableToolbar={isDisabled}
                  keyText={"topic-metrics-time-filter"}
                />
                <ToolbarItem>
                  <Button
                    isLoading={isRefreshing}
                    variant="plain"
                    aria-label="sync"
                    onClick={onRefresh}
                  >
                    {!isRefreshing && <SyncIcon />}
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </CardActions>
        </CardHeader>
        <Divider />
      </>
    );
  };
